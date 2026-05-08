all api is for testing - in production node.js backend should be calling this service
instead this service should communicate with reddit public json and the database

testing api (to be added)
- fetching new posts from a specified subreddit
- fetching new posts from a list of subreddits



choose to use python because it's easier to process data and run machine learning algs.


three tables
1. posts_info
2. keywords_info, this table is dependent on rows in posts_info
3. keywords_trends, this table is written to by a cron on postgre db


problem: we need to figure out a way to combine two similar keywords.
for example, "coding" and "code"

solution:
    use spacy library

tomorrow:
    implement the workflow that generates the keywords table

we probably want to keep more than one method of keyword extraction - we will see

