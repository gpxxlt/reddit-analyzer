import asyncio
import json
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException

import anthropic

import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL") or ""
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or ""
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

USER_AGENT = "reddit-python-backend/0.1"
OUTPUT_FILE = Path("posts.json")
OUTPUT_FILE_FILTERED = Path("posts_filtered.json")
POLL_DIR = Path("polls")           # timestamped filtered batches go here
POLL_INTERVAL = 5 * 60            # seconds
POLL_SUBREDDIT = "diablo3"
WRITE_TO_DB = True

TEST_POST_FILE = Path("posts_test.json")

KEEP_FIELDS = {
    "id",
    "title",
    "selftext",        # body text of the post; empty string for link posts
    "score",
    "upvote_ratio",
    "num_comments",
    "created_utc",
    # "url",
    "link_flair_text", # mod/user-assigned category tag, e.g. "QUESTION", "GUIDE"
    # "is_self",         # True = text post, False = link post
    # "stickied",        # pinned to top of subreddit by a mod
    # "locked",          # comments disabled
    # "total_awards_received",
    # "num_crossposts",
    "subreddit",
}


def filter_post(raw: dict, subreddit: str) -> dict:
    new = {f: raw[f] for f in KEEP_FIELDS if f in raw}
    if "created_utc" in new:
        new["created_utc"] = datetime.fromtimestamp(new["created_utc"], tz=timezone.utc).isoformat()
    return new


async def fetch_subreddit_posts(subreddit: str, limit: int) -> list[dict]:
    params = {"limit": min(limit, 100)}
    headers = {"User-Agent": USER_AGENT}

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://www.reddit.com/r/{subreddit}/new.json",
            headers=headers,
            params=params,
        )

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch posts from Reddit")

    children = response.json()["data"]["children"]
    return [child["data"] for child in children]


async def poll_loop():
    POLL_DIR.mkdir(exist_ok=True)
    while True:
        try:
            posts = await fetch_subreddit_posts(POLL_SUBREDDIT, limit=25)
            filtered = [filter_post(p, POLL_SUBREDDIT) for p in posts]
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")  # UTC time
            out = POLL_DIR / f"posts_{timestamp}.json"
            out.write_text(json.dumps(filtered, indent=2))
            
            # Logging information to console for debugging
            utc_now = datetime.now(timezone.utc)
            local_now = utc_now.astimezone()
            print(
                f"[poll] wrote {out} | "
                f"UTC: {utc_now.strftime('%Y-%m-%d %H:%M:%S')} | "
                f"Local ({local_now.tzname()}): {local_now.strftime('%Y-%m-%d %H:%M:%S')}"
            )
            
            # Writing data to supabase instance
            if WRITE_TO_DB:
                supabase.table("posts_info").upsert(filtered, on_conflict="id").execute()
            
            # TODO: Run a function that enerates keywords and perform insertion
            # Version 1 
            # Use ChatGPT/Claude as a microservice to extract the keywords
            # If token consumption rate is too fast, try other LLMs
            # Verions 2
            # Use specific natural language processing algorithms, for example
            # https://pypi.org/project/rake-nltk/ 
            
            
        except Exception as e:
            print(f"[poll] error: {e}")
            
        await asyncio.sleep(POLL_INTERVAL)


@asynccontextmanager
async def lifespan(_: FastAPI):
    task = asyncio.create_task(poll_loop())
    yield
    task.cancel()


app = FastAPI(lifespan=lifespan)


@app.get("/fetch-posts")
# Example usages:
# curl "http://localhost:8000/fetch-posts?subreddit=diablo3&limit=10"
# curl "http://localhost:8000/fetch-posts?subreddit=leagueoflegends"
async def fetch_new_posts(
    subreddit: str = "diablo3",  # subreddit name without the r/ prefix
    limit: int = 25,             # number of posts to fetch, capped at 100
):
    posts = await fetch_subreddit_posts(subreddit, limit)
    posts_filtered = [filter_post(p, subreddit) for p in posts]

    OUTPUT_FILE.write_text(json.dumps(posts, indent=2))
    OUTPUT_FILE_FILTERED.write_text(json.dumps(posts_filtered, indent=2))

    return {
        "fetched": len(posts),
        "saved_to": str(OUTPUT_FILE),
        "filtered_saved_to": str(OUTPUT_FILE_FILTERED),
    }


@app.get("/extract-keywords")
# API for testing keyword extraction by AI agents
# Also a template for testing and evaluating
# Example usages:
# curl "http://localhost:8000/extract-keywords"
async def extract_keywords(
    method: str = "claude"
):
    with open(TEST_POST_FILE, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    # Extract only post title, subreddit, postid, and selftext
    keep_fields = {
        "id",
        "title",
        "selftext",
        "subreddit"    
    }
    post_data = []
    for post in data:
        post_data.append({f: post[f] for f in keep_fields if f in post})
    
    # Prompting claude for a structured response
    model = "claude-haiku-4-5" if method == "claude" else "claude-sonnet-4-6"
    prompt = f'''
        As an expert in natural language processing, you are tasked to perform keyword extraction from reddit posts.
        The data is presented to you as an array of object.
        {post_data}
        For each item, generate 1 to 5 unique keywords, and format them as specified by output_config.
        Specs for each item in the output:
        {{
            "post_id": "id of the post from which the keyword is extracted",
            "keyword": "the keyword extracted",
            "subreddit": "subreddit where the post is posted"
        }}
    '''
    
    response = anthropic.Anthropic().messages.create(
        model=model,
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        output_config={
            "format": {
                "type": "json_schema",
                "schema": {
                    "type": "object",
                    "properties": {
                        "results": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "post_id": {"type": "string"},
                                    "keyword": {"type": "string"},
                                    "subreddit": {"type": "string"},
                                },
                                "required": ["post_id", "keyword", "subreddit"],
                                "additionalProperties": False,
                            },
                        }
                    },
                    "required": ["results"],
                    "additionalProperties": False,
                },
            }
        },
    )
    
    # Extract the list of keywords from the response and write to db
    if response.content[0].type == "text":
        res = json.loads(response.content[0].text)
        
        if WRITE_TO_DB:
            for obj in res["results"]:
                supabase.table("keywords_info").upsert(obj).execute()
                
        return {
            "status": "success",
            "message": "succcesfully extracted keywords from posts and write to db"
        }
    else:
        return {
            "status": "error",
            "message": "something went wrong with claude's response"
        }
    