var file = 'data/trip.csv';
var w = window.innerWidth,
    h = window.innerHeight;
var scaleX = d3.scaleLinear(),
    scaleY = d3.scaleLinear(),
    scaleR = d3.scaleLinear().range([1, 10]),
    // scaleOpacity = d3.scaleLinear().range([.8, .4]),
    scaleoneX = d3.scaleLinear(),
    scaleDayY = d3.scaleLinear(),
    scaleColor = d3.scaleLinear()
    // .range(['#4e6a42','#b3ab23','#c77961'])
    // .range(['#b3ab23','#4e6a42','#ad492c'])
    // .range(['#9ec06b','#4e6a42','#ad492c'])
    // .range(['#9ec06b','#b3ab23','#ad492c'])
    .range(['#d9e021', '#5b600f', '#ad492c'])
// .range(['#d9e021', '#747a2f', '#7a412f'])
;
//Axis
// var axisX = d3.axisTop()
//     .scale(scaleX)
//     .tickValues([1456808400000, 1459483200000, 1462075200000, 1464753600000, 1467345600000, 1470024000000, 1472702400000, 1475294400000, 1477972800000, 1480568400000, 1483246800000, 1485925200000])
//     .tickSize(0)
//     .tickFormat(d3.timeFormat('%b'));
var axisY = d3.axisLeft()
    .scale(scaleY)
    .ticks(25)
    .tickSize(0)
    .tickFormat(d => `${d}:00`);
var axisSmallX = d3.axisBottom()
    .scale(scaleoneX)
    .ticks(4)
    .tickSize(0)
    .tickFormat(d => `${Math.floor(d / 60)}min`);

var testDay = new Date(new Date(new Date().setHours(0, 0, 0)).setYear(2016));


var svgH = h * .75,
    svgW = w * .95;

var oneH = svgH * .9,
    oneW = svgW * .45;
var dayH = svgH * .04;

var svg = d3.select('#canvas')
    .append('svg')
    .attr('transform', `translate(${w * .05 / 2}, 0)`)
    .attr('width', svgW).attr('height', svgH)


var nowDay = svg.append('g').attr('class', 'nowDay hidden')
// nowDay.append('line')
// .attr('transform', `translate(0,${dayH + 25})`)
nowDay.append('text').attr('class', 'dayName')
nowDay.append('text').attr('class', 'dayTitle').text('Time distribution of each cyclying duration')
// .attr('transform', `translate(0,${dayH + 25})`)
nowDay.append('rect').attr('transform', `translate(1,${dayH + 25})`)
    .attr('width', oneW).attr('height', oneH)

var oneDay = nowDay.append('g').attr('class', 'oneday')
nowDay.append('g').attr('class', 'axis axis-x')


var seasonPoint = [
    { name: 'spring', range: [3, 4, 5], color: '#b3ab23', order: 1 },
    { name: 'summer', range: [6, 7, 8], color: '#4e6a42', order: 2 },
    { name: 'autumn', range: [9, 10, 11], color: '#c77961', order: 3 },
    { name: 'winter', range: [12, 1, 2], color: '#4a5b58', order: 4 }
]


// var dayPoint = [
//     { name: 'sunday', order: 1 },
//     { name: 'monday', order: 2 },
//     { name: 'tuesday', order: 3 },
//     { name: 'wednesday', order: 4 },
//     { name: 'thursday', order: 5 },
//     { name: 'friday', order: 6 },
//     { name: 'saturday', order: 7 },
// ]
var durations = d3.set();
var people, duration;

function removeCover() {
    d3.select('#cover').classed('hidden', true)
}

d3.queue()
    .defer(d3.csv, file, parse)
    .await(dataloaded);

function dataloaded(err, trips) {
    console.log(trips)

    people = trips.length;
    duration = d3.sum(trips, d => d.duration)
    fillNumber(people, duration)
    svg.on('mouseleave', e => {
        nowDay.classed('hidden', true)
        resetDay()
        fillNumber(people, duration)
    })


    var tripsBynest = d3.nest()
        .key(d => d.start_day)
        .key(d => d.start_hour)
        .rollup(d => { return { data: d, sum: d3.sum(d, e => e.duration), people: d.length } })
        .entries(trips)
    console.log(tripsBynest)

    // const allDayinYear = d3.extent(trips, d => d.start_day)
    const allDayinYear = d3.extent(tripsBynest, d => new Date(d.key))
    const allDurationinYear = d3.extent(tripsBynest.map(d => d.values.map(e => e.value.sum)).reduce((a, b) => a.concat(b)))
    const durationByDay = d3.extent(tripsBynest.map(d => d3.sum(d.values, e => e.value.sum)))

    scaleX.domain(allDayinYear).range([w * .1 / 2, w * .93])
    scaleY.domain(d3.extent(trips, d => d.start_hour)).range([oneH, dayH * 2])
    scaleR.domain(allDurationinYear)
    scaleoneX.domain(d3.extent(trips, d => d.duration))

    scaleDayY.domain(durationByDay).range([5, dayH])

    const allPeopleYear = d3.extent(tripsBynest.map(d => d.values.map(e => e.value.people)).reduce((a, b) => a.concat(b)))
    const mid = (allPeopleYear[0] + allPeopleYear[1]) / 2
    allPeopleYear.splice(1, 0, mid)
    scaleColor.domain(allPeopleYear)

    var days = svg.append('g').selectAll('.days').data(tripsBynest)
    var enterdays = days.enter()
        .append('g').attr('class', 'days')
        .attr('id', d => `dayGroup${Date.parse(d.key)}`)
        .attr('transform', d => `translate(${scaleX(new Date(d.key))},${dayH})`)

    enterdays.selectAll('.circle').data(d => d.values).enter()
        .append('circle').attr('r', d => scaleR(d.value.sum))
        .style('fill', d => scaleColor(d.value.people))
        .style('fill-opacity', .4)
        .style('stroke', d => scaleColor(d.value.people))
        .style('stroke-width', .5)
        .attr('cy', d => scaleY(d.value.data[0].start_hour))

    // days.merge(enterdays)
        // .transition().duration(2000)
        // .attr('transform', d => `translate(${scaleX(new Date(d.key))},${dayH})`)
    enterdays.append('rect')
        .style('fill', '#748e76')
        .attr('y', d => (30 - scaleDayY(d3.sum(d.values, e => e.value.sum))) / 2)
        .attr('width', 1)
        .attr('height', d => scaleDayY(d3.sum(d.values, e => e.value.sum)))

    enterdays.append('rect')
        .attr('class', 'sticker')
        .attr('id', d => `id${Date.parse(d.key)}`)
        .style('fill', '#d3e0d1')
        .attr('y', d => (30 - scaleDayY(d3.sum(d.values, e => e.value.sum))) / 2)
        .attr('width', 1)
        .attr('height', 0)

    enterdays.append('rect')
        .attr('class', d => `class${Date.parse(d.key)}`)
        .attr('x', -1.5)
        .style('opacity', 0)
        .attr('width', 3)
        .attr('height', 30)
        .style('cursor', 'pointer')
        .on('mouseover', d => {

            prepareDay(new Date(d.key))
            drawDay(new Date(d.key), d.values)
        })

    let lable = svg.append('text')
        .attr('class', 'axisLable')
        .attr('transform', `translate(${w * .09 / 2 / 2},${dayH})`)
        .html(`<tspan x=0 dy=10 >daily</tspan><tspan x=0 dy=10 >sum</tspan>`)
    // lable.append('tspan').text('Daily')

    // lable.append('tspan').text('sum')

    // //Draw axis
    // svg.append('g').attr('class', 'axis axis-x')
    //     .attr('transform', `translate(0,${dayH})`)
    //     .call(axisX);
    svg.append('g').attr('class', 'axis axis-y')
        .attr('transform', `translate(${w * .09 / 2},${dayH})`)
        .call(axisY);

    d3.select('#explore').classed('hidden', false)
    d3.select('.loading').classed('hidden', true)
}

function resetDay() {

    svg.selectAll('.sticker').style('fill', '#748e76').attr('height', 0)
    svg.selectAll('.selected').classed('selected', false)

}

function prepareDay(nowDayDate) {
    resetDay();
    svg.select(`#dayGroup${Date.parse(nowDayDate)}`).selectAll('circle').classed('selected', true)
    console.log(`#dayGroup${Date.parse(nowDayDate)}`)

    svg.select(`#id${Date.parse(nowDayDate)}`).attr('height', oneH + 10).style('fill', '#d3e0d1')

    nowDay.classed('hidden', false)
    const realPosition = scaleX(nowDayDate)
    const fixedPosition = (realPosition + oneW) > svgW ? (realPosition - oneW - 1) : realPosition

    var nowDayArray = nowDayDate.toUTCString().split(' ')
    nowDay.attr('transform', `translate(${fixedPosition},0)`)
    nowDay.selectAll('.onecircle').remove()

    // nowDay.select('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', oneH + 10)
    nowDay.select('.dayName').text(`${+nowDayArray[1]} ${nowDayArray[2]}`)
        .attr('x', (realPosition + oneW) < svgW ? 0 : oneW)
        .attr('y', 15)
    nowDay.select('.dayTitle')
        .attr('x', oneW / 2)
        .attr('y', oneH * 2)
    nowDay.node().parentNode.appendChild(nowDay.node())


}

function fillNumber(people, duration) {
    let numbers = getNumber(duration);

    document.querySelector('#people').innerHTML = people.toLocaleString();
    document.querySelector('#calories').innerHTML = `${Math.floor(numbers[0]).toLocaleString()} ${numbers[1]}`;
    document.querySelector('#co2').innerHTML = `${Math.floor(numbers[2]).toLocaleString()} ${numbers[3]}`;

}

function getNumber(duration) {
    const calories = duration * 204 / 3600;
    const co2 = duration / 2400 * 9.3 * 411 / 1000;
    let unitCo2, fixedCo2, unitCal, fixedCal;
    if (co2 > 10000) {
        unitCo2 = 'tons';
        fixedCo2 = co2 / 1000;
    } else if (co2 < 1) {
        unitCo2 = 'g'
        fixedCo2 = co2 * 1000;
    } else {
        unitCo2 = 'kg'
        fixedCo2 = co2;
    }
    if (calories > 100000) {
        unitCal = 'k ';
        fixedCal = calories / 1000;
    } else {
        unitCal = ''
        fixedCal = calories;
    }
    return [fixedCal, unitCal, fixedCo2, unitCo2]
}

function fillMe(duration) {
    let numbers = getNumber(duration);
    document.querySelector('#myCalories').innerHTML = `${Math.floor(numbers[0]).toLocaleString()} ${numbers[1]}`
    document.querySelector('#myCO2').innerHTML = `${Math.floor(numbers[2]).toLocaleString()} ${numbers[3]}`
}

function drawDay(nowDayDate, data) {
    const realPosition = scaleX(nowDayDate)
    let fixedPosition
    if ((realPosition + oneW) > svgW) {
        fixedPosition = oneW
        scaleoneX.range([oneW - 10, 5])
    } else {
        fixedPosition = 0
        scaleoneX.range([5, oneW - 10])
    }
    const onedayData = data.map(d => { return { hour: +d.key, data: d3.nest().key(d => d.duration).entries(d.value.data) } })

    const nowPeople = d3.sum(data, d => d.value.people)
    const nowDuration = d3.sum(data, d => d.value.sum)
    fillNumber(nowPeople, nowDuration)

    const allPeopleDay = d3.extent(onedayData.map(d => d.data.map(e => e.values.length)).reduce((a, b) => a.concat(b)))

    const mid = (allPeopleDay[0] + allPeopleDay[1]) / 2
    allPeopleDay.splice(1, 0, mid)

    scaleColor.domain(allPeopleDay)


    var updateOnehour = oneDay.selectAll('.hours').data(onedayData, d => d.hour)
    updateOnehour.exit().remove()
    var enterOnehour = updateOnehour.enter().append('g').attr('class', 'hours')
        .attr('transform', d => `translate(0,${scaleY(d.hour) + dayH})`)
        .on('mouseover', d => console.log(d.hour))

    var updateOne = updateOnehour.selectAll('.onecircle')
        // .attr('cx', (realPosition + oneW + 30) > svgW ? oneW : 0)
        .data(d => d.data)
    updateOne.exit().remove()
    var enterOne = updateOne.enter().append('circle')
        .attr('class', 'onecircle')
        .attr('r', 1.5)
        .attr('cx', fixedPosition)
        .style('stroke-width', .5)
        .style('fill-opacity', .2)
        .attr('id', d => `id${d.key}${d.values[0].start_hour}`)
        .on('mouseover', d => console.log(d))


    updateOnehour.merge(enterOnehour).attr('transform', d => `translate(0,${scaleY(d.hour) + dayH})`)
    svg.select('.axis-x').attr('transform', d => `translate(0,${oneH + dayH + 10})`).call(axisSmallX);

    updateOne
        .merge(enterOne)

        .attr('cx', fixedPosition)
        .style('fill', d => scaleColor(d.values.length))
        .style('stroke', d => scaleColor(d.values.length))
        .transition()
        .attr('cx', d => scaleoneX(+d.key))
        .duration(2000)

}

function locateMe(min) {
    d3.select('.locateMe').classed('locateMe', false)

    if (min * 60 < 300) { min = 5 }
    if (min * 60 > 7200) { min = 120 }

    document.querySelector('input[name="myCycle"]').value = min
    let duration = min * 60;
    let nowHour = new Date().getHours()
    d3.select(`.class${Date.parse(testDay)}`).dispatch('mouseover')

    fillMe(duration)
}


function parse(d) {
    var date = new Date(d['starttime'].replace(/-/g, "/"));
    var refDate = new Date(date)
    var day = new Date(refDate.setHours(0, 0, 0))
    // var mon = date.getMonth() + 1
    // var seasons = seasonPoint.find(e => e.range.includes(mon))
    if (+d.tripduration > 7200 || +d.tripduration < 300) return
    return {
        start_at: date,
        start_hour: date.getHours(),
        start_day: day,
        // season_color: seasons.color,
        // day: date.getDay(),
        // season: seasons.order,
        duration: +d.tripduration,
    }
}