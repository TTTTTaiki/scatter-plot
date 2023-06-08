import "./App.css"
import * as d3 from "d3";
import { useEffect, useState } from "react";
import { fetchData } from "./functions";

function ScatterPlot(props) {
	const fullData = props.data1;
	const speciesData = props.data2;
	const variables = [
		{ label: "Sepal Width", value: "sepalWidth" },
		{ label: "Sepal Length", value: "sepalLength" },
		{ label: "Petal Width", value: "petalWidth" },
		{ label: "Petal Length", value: "petalLength" }
	];
	const [xProp, setXProp] = useState(variables[0]);
	const [yProp, setYProp] = useState(variables[1]);
	const [visibleArray, setVisibleArray] = useState(speciesData);

	const contentW = 400, contentH = 400;
	const margin = { top: 50, bottom: 100, left: 100, right: 300 };
	const windowW = contentW + margin.left + margin.right;
	const windowH = contentH + margin.top + margin.bottom;
	const lineCol = "#444";
	const color = d3.scaleOrdinal(d3.schemeCategory10);
	for (const item of fullData) {
		color(item.species);
	}

	// nice!!!!!
	const scaleX = d3.scaleLinear()
		.domain(d3.extent(fullData, item => item[xProp.value]))
		.range([0, contentW])
		.nice();
	const scaleY = d3.scaleLinear()
		.domain(d3.extent(fullData, item => item[yProp.value]))
		.range([contentH, 0])
		.nice();


	return (
		<div>
			{/* 軸選ぶやつ */}
			<div style={{ width: "500px", margin: "50px" }}>
				<p>Horizontal Axis</p>
				<select className='select'
					value={variables.value}
					defaultValue={xProp.value}
					onChange={(event) => {
						event.preventDefault();
						setXProp(variables.find(item => item.value === event.target.value))
					}}
				>
					{variables.map((item, i) => {
						return <option key={i} value={item.value}>{item.label}</option>
					})}
				</select>

				<p>Vertical Axis</p>
				<select className='select'
					value={variables.value}
					defaultValue={yProp.value}
					onChange={(event) => {
						event.preventDefault();
						setYProp(variables.find(item => item.value === event.target.value))
					}}
				>
					{variables.map((item, i) => {
						return <option key={i} value={item.value}>{item.label}</option>
					})}
				</select>
			</div>

			{/* svg開始 */}
			<svg width={windowW} height={windowH}>
				<g transform={`translate(${margin.left}, ${margin.top})`}>
					{/* x軸 */}
					<g transform={`translate(0, ${contentH})`}>
						<line x1="0" y1="0" x2={contentW} y2="0" stroke={lineCol}></line>
						<text x={contentW / 2} y="40" textAnchor="middle" dominantBaseline="central">{[xProp.label]}</text>
						{
							scaleX.ticks().map((tickValue, index) => {
								return (
									<g transform={`translate(${scaleX(tickValue)}, 0)`} key={index}>
										<line x1="0" y1="0" x2="0" y2="5" stroke={lineCol}></line>
										<text x="0" y="15" textAnchor="middle" dominantBaseline="central">{tickValue}</text>
									</g>
								);
							})
						}
					</g>
					{/* y軸 */}
					<g>
						<line x1="0" y1="0" x2="0" y2={contentH} stroke={lineCol}></line>
						<g transform="rotate(-90)">
							<text x={-contentH / 2} y="-60" textAnchor="middle" dominantBaseline="central">{[yProp.label]}</text>
						</g>
						{
							scaleY.ticks().map((tickValue, index) => {
								return (
									<g transform={`translate(0, ${scaleY(tickValue)})`} key={index}>
										<line x1="0" y1="0" x2="-5" y2="0" stroke={lineCol}></line>
										<text x="-15" y="0" textAnchor="end" dominantBaseline="central">{tickValue}</text>
									</g>
								);
							})
						}
					</g>

					{/* plotしていく */}
					<g>
						{
							fullData.filter(item => visibleArray.includes(item.species)).map((item, index) => {
								return (
									<circle key={index}
										cx={scaleX(item[xProp.value])} cy={scaleY(item[yProp.value])} r="5" fill={color(item.species)}
										style={{ transitionDuration: '1s' }}
									/>
								);
							})
						}
					</g>

					{/* 凡例 + visibilityの更新 */}
					<g transform={`translate(${contentW + 50}, 0)`}>
						{
							speciesData.map((item, index) => {
								return (
									<g key={index} transform={`translate(0, ${index * 30})`}
										style={{ cursor: 'pointer' }}
										onClick={() => {
											if (visibleArray.includes(item)) {
												const newVisibility = visibleArray.filter(target => item !== target)
												setVisibleArray(newVisibility);
											} else {
												const newVisibility = Array.from(visibleArray);
												newVisibility.push(item);
												setVisibleArray(newVisibility);
											}
										}}>
										<rect x="0" y="0" width="10" height="10" fill={color(item)}></rect>
										<text x="20" y="0" textAnchor="left" dominantBaseline="central">{[item]}</text>
									</g>
								);
							})
						}
					</g>
				</g>
			</svg>
		</div>
	);
}

function Loading() {
	console.log("Loading...");
	return (
		<div>
			<p>Loading...</p>
		</div>
	);
}

function App() {
	const [flowerData, setFlowerData] = useState(null);
	const [speciesData, setSpeciesData] = useState(null);

	useEffect(() => {
		fetchData()
			.then((data) => {
				setFlowerData(data);
				const set = new Set(data.map(item => item.species));
				const speciesArray = Array.from(set);
				setSpeciesData(speciesArray);
			})
	}, []);

	//確認用
	console.log(flowerData);
	console.log(speciesData);

	if (flowerData && speciesData) {
		return (
			<div>
				<h1 className="title">
					Scatter Plot of Iris Flower Dataset
				</h1>
				<ScatterPlot data1={flowerData} data2={speciesData} />
			</div>
		);
	} else {
		<Loading />
	}
}
export default App;