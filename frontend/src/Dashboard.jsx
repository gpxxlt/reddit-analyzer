import { useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';


function ViewSelector({ handleViewChange }) {
	return (
		<label>
			<select name="selectedView" defaultValue="popular" onChange={(e) => handleViewChange(e.target.value)}>
				<option value="popular">Most Popular</option>
				<option value="trending">Fastest Growing</option>
			</select>
		</label>
	);
}

// Testing data
const keywordsTest0 = [
    {name: "hello", count: 10000},
    {name: "world", count: 5000},
];

const keywordsTest1 = [
    {name: "mock", count: 8000},
    {name: "data", count: 7000},
];

// Testing data
const trend0 = [
    {
        name: "hello",
        data: [
        { time: "0h",  count: 42 },
        { time: "1h",  count: 38 },
        { time: "2h",  count: 31 },
        { time: "3h",  count: 27 },
        { time: "4h",  count: 24 },
        { time: "5h",  count: 29 },
        { time: "6h",  count: 45 },
        { time: "7h",  count: 63 },
        { time: "8h",  count: 89 },
        { time: "9h",  count: 112 },
        { time: "10h", count: 134 },
        { time: "11h", count: 148 },
        { time: "12h", count: 155 },
        { time: "13h", count: 162 },
        { time: "14h", count: 158 },
        { time: "15h", count: 171 },
        { time: "16h", count: 165 },
        { time: "17h", count: 178 },
        { time: "18h", count: 159 },
        { time: "19h", count: 143 },
        { time: "20h", count: 127 },
        { time: "21h", count: 108 },
        { time: "22h", count: 84 },
        { time: "23h", count: 61 },
        ],
    },
    {
        name: "world",
        data: [
        { time: "0h",  count: 95 },
        { time: "1h",  count: 88 },
        { time: "2h",  count: 76 },
        { time: "3h",  count: 65 },
        { time: "4h",  count: 58 },
        { time: "5h",  count: 62 },
        { time: "6h",  count: 71 },
        { time: "7h",  count: 80 },
        { time: "8h",  count: 74 },
        { time: "9h",  count: 69 },
        { time: "10h", count: 85 },
        { time: "11h", count: 103 },
        { time: "12h", count: 118 },
        { time: "13h", count: 97 },
        { time: "14h", count: 111 },
        { time: "15h", count: 126 },
        { time: "16h", count: 140 },
        { time: "17h", count: 133 },
        { time: "18h", count: 119 },
        { time: "19h", count: 145 },
        { time: "20h", count: 152 },
        { time: "21h", count: 138 },
        { time: "22h", count: 121 },
        { time: "23h", count: 109 },
        ],
    }
];

const trend1 = [
  {
    name: "mock",
    data: [
        { time: "0h",  count: 173 },
        { time: "1h",  count: 45 },
        { time: "2h",  count: 118 },
        { time: "3h",  count: 7 },
        { time: "4h",  count: 156 },
        { time: "5h",  count: 92 },
        { time: "6h",  count: 34 },
        { time: "7h",  count: 187 },
        { time: "8h",  count: 61 },
        { time: "9h",  count: 143 },
        { time: "10h", count: 29 },
        { time: "11h", count: 198 },
        { time: "12h", count: 77 },
        { time: "13h", count: 112 },
        { time: "14h", count: 55 },
        { time: "15h", count: 164 },
        { time: "16h", count: 19 },
        { time: "17h", count: 138 },
        { time: "18h", count: 83 },
        { time: "19h", count: 47 },
        { time: "20h", count: 191 },
        { time: "21h", count: 66 },
        { time: "22h", count: 124 },
        { time: "23h", count: 39 },
        ],
    },
    {
        name: "data",
        data: [
        { time: "0h",  count: 88 },
        { time: "1h",  count: 152 },
        { time: "2h",  count: 23 },
        { time: "3h",  count: 109 },
        { time: "4h",  count: 74 },
        { time: "5h",  count: 196 },
        { time: "6h",  count: 41 },
        { time: "7h",  count: 130 },
        { time: "8h",  count: 15 },
        { time: "9h",  count: 167 },
        { time: "10h", count: 53 },
        { time: "11h", count: 99 },
        { time: "12h", count: 182 },
        { time: "13h", count: 36 },
        { time: "14h", count: 145 },
        { time: "15h", count: 70 },
        { time: "16h", count: 114 },
        { time: "17h", count: 8 },
        { time: "18h", count: 177 },
        { time: "19h", count: 62 },
        { time: "20h", count: 133 },
        { time: "21h", count: 48 },
        { time: "22h", count: 159 },
        { time: "23h", count: 94 },
        ],
    }
];


function SubredditList() {
    // A section for selecting subreddits via checkbox
}


function GraphPanel({ keyword, data }) {

    // need some wrappers around this graph, but ignored for now
    // Display the graph
    // https://recharts.github.io/en-US/guide/getting-started/
    return (
        <LineChart style={{ width: '100%', aspectRatio: 1.618, maxWidth: 600 }} responsive data={data}>
            <CartesianGrid />
            <Line dataKey="count" />
            <XAxis dataKey="time" />
            <YAxis />
            <Legend />
            <RechartsDevtools />
        </LineChart>
    );
}


function DataPanel() {
    const [popularKeywords, setPopularKeywords] = useState([]);
    const [trendingKeywords, setTrendingKeywords] = useState([]);
    const [data, setData] = useState([]); // temporary
    const [view, setView] = useState("popular");
    const [currentKeyword, setCurrentKeyword] = useState("");
    
    // If we need auto refresh ... then useeffect waits for timer
    // Manual refresh for now

    const handleRefresh = async () => {
        // Logic for fetching from API endpoint
        // useEffect -> fetch api/popular / api/trending
        // ...

        setPopularKeywords(keywordsTest0); // use mock data for now
        setTrendingKeywords(keywordsTest1);
        setCurrentKeyword(keywordsTest0[0].name);
    }

    const handleKeywordChange = async (keyword) => {
        // does nothing if keyword = current keyword
        // update currentkeyword if 
        if (keyword !== currentKeyword) {
            console.log(keyword)
            setCurrentKeyword(keyword);
            if (view === "popular") {
                const result = trend0.find((item) => item.name === keyword)?.data;
                setData(result)
            } else {
                const result = trend1.find((item) => item.name === keyword)?.data;
                setData(result)
            }
        }
    }

    const handleViewChange = async (newView) => {
		setView(newView);
        if (view === "popular") setCurrentKeyword(popularKeywords[0].name);
        else setCurrentKeyword(trendingKeywords[0].name);
    }

    // Upon the button on left is clicked, graph on right is updated
    // use IntersectionObserver: after the graph is rendered, there is no re-rendering upon navigation

    return (
        <div className="grid grid-cols-[1fr_1.6fr] h-screen gap-2">
            <button onClick={() => handleRefresh()}>Refresh</button>
            {/* keyword list */}
            <div className="flex">
                <div>
					<ViewSelector handleViewChange={handleViewChange} />
				</div>
                <div> keyword mentions </div>
                <ul>
                    { view === "popular" && 
                      popularKeywords.map((item) => 
                        <li key={item.name}>
                            <button onClick={() => handleKeywordChange(item.name)}>{item.name}: {item.count}</button>
                        </li>) }
                    { view === "trending" && 
                      trendingKeywords.map((item) => 
                        <li key={item.name}>
                            <button onClick={() => handleKeywordChange(item.name)}>{item.name}: {item.count}</button>
                        </li>) }
                </ul>
            </div>
            <GraphPanel keyword={currentKeyword} data={data}/>
        </div>
    );
}


export default function Dashboard() {
    return (
        <div className="grid grid-rows-[1fr_3fr] h-screen gap-2">
            <SubredditList className="bg-blue-400"/>
            <DataPanel className="bg-blue-200"/>
        </div>
    );
}
