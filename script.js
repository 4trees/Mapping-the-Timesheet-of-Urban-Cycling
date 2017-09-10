var file = 'data/trip.csv';
var w = window.innerWidth,
    h = window.innerHeight;
var scaleX = d3.scaleLinear(),
    scaleY = d3.scaleLinear(),
    scaleR = d3.scaleLinear().range([1, 10]),
    scaleoneX = d3.scaleLinear(),
    scaleDayY = d3.scaleLinear(),
    scaleColor = d3.scaleLinear()
    .range(['#d9e021', '#5b600f', '#ad492c']);

//Axis
var axisY = d3.axisLeft()
    .scale(scaleY)
    .ticks(25)
    .tickSize(0)
    .tickFormat(d => renameTime(d));
var axisSmallX = d3.axisBottom()
    .scale(scaleoneX)
    .tickValues([1800, 3600, 5400])
    .tickSize(0)
    .tickFormat(d => `${Math.floor(d / 60)}min`);

var testDay = new Date(new Date(new Date().setHours(0, 0, 0)).setYear(2016));
var nowPeople, nowDuration, nowDate;
const AllPeople = 1064053,
    AllDuration = 992909031,
    AllDate = 'one year';
var isOpen = false;

var svgH = h * .77,
    svgW = w * .95;

var oneH = svgH * .9,
    oneW = svgW * .45;
var dayH = svgH * .04;

var svg = d3.select('#canvas')
    .append('svg')
    .attr('transform', `translate(${w * .05 / 2}, 0)`)
    .attr('width', svgW).attr('height', svgH)

var mycycle = document.querySelector('input[name="myCycle"]')
var nowDay = svg.append('g').attr('class', 'nowDay')

var nowDayName = nowDay.append('g')
nowDayName.append('text').attr('class', 'dayName')
var nowDayContent = nowDay.append('g').attr('class', 'hidden')
nowDayContent.append('text').attr('class', 'dayName dayNameInTable')
let nowDayTable = nowDayContent.append('g')
nowDayTable.append('rect').attr('transform', `translate(1,${dayH * 2 + 25})`)
    .attr('width', oneW).attr('height', oneH)
nowDayTable.append('text').attr('class', 'dayTitle').text('Minutes distribution in one day')
    .attr('transform', `translate(0,${dayH})`)

var oneDay = nowDayTable.append('g').attr('class', 'oneday')
nowDayTable.append('g').attr('class', 'axis axis-x')


var seasonPoint = [
    { name: 'spring', range: [3, 4, 5], color: '#b3ab23', order: 1 },
    { name: 'summer', range: [6, 7, 8], color: '#4e6a42', order: 2 },
    { name: 'autumn', range: [9, 10, 11], color: '#c77961', order: 3 },
    { name: 'winter', range: [12, 1, 2], color: '#4a5b58', order: 4 }
]


function removeCover() {
    d3.select('#cover').classed('hidden', true)
}

d3.queue()
    .defer(d3.csv, file, parse)
    .await(dataloaded);

function dataloaded(err, trips) {
    // console.log(trips)

    people = trips.length;
    duration = d3.sum(trips, d => d.duration)
    fillNumber(AllPeople, AllDuration, AllDate)

    var tripsBynest = d3.nest()
        .key(d => d.start_day)
        .key(d => d.start_hour)
        .rollup(d => { return { data: d, sum: d3.sum(d, e => e.duration), people: d.length } })
        .entries(trips)
    // console.log(tripsBynest)

    const allDayinYear = d3.extent(tripsBynest, d => new Date(d.key))
    const allDurationinYear = d3.extent(tripsBynest.map(d => d.values.map(e => e.value.sum)).reduce((a, b) => a.concat(b)))
    const durationByDay = d3.extent(tripsBynest.map(d => d3.sum(d.values, e => e.value.sum)))

    scaleX.domain(allDayinYear).range([w * .1 / 2, w * .93])
    scaleY.domain(d3.extent(trips, d => d.start_hour)).range([oneH + dayH * .25, dayH * 2.5])
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

    enterdays.selectAll('circle').data(d => d.values).enter()
        .append('circle').attr('r', d => scaleR(d.value.sum))
        .style('fill', d => scaleColor(d.value.people))
        .style('fill-opacity', .4)
        .style('stroke', d => scaleColor(d.value.people))
        .style('stroke-width', .5)
        .style('cursor', 'pointer')
        .attr('cy', d => scaleY(d.value.data[0].start_hour))
        .on('mouseover', function(d) {

            nowDayName.select('text').text('')
            d3.selectAll('.highlight').classed('highlight', false)
            d3.select(this).classed('highlight', true)
            const nowDayArray = new Date(d.value.data[0].start_day).toUTCString().split(' ')
            thisDate = `${nowDayArray[2]}. ${+nowDayArray[1]}`
            thisPoeple = d.value.people
            thisDuration = d.value.sum
            fillNumber(thisPoeple, thisDuration, `one hour since ${renameTime(d.key)} on ${thisDate}`)
        })
        .on('mouseleave', function(d) {
            svg.selectAll('.daily').style('fill', '#748e76')

            
        })
        .on('click', function(d) {
            resetAll()
            const nowDayArray = new Date(d.value.data[0].start_day).toUTCString().split(' ')
            nowDate = `${nowDayArray[2]}. ${+nowDayArray[1]}`
            nowPeople = d.value.people
            nowDuration = d.value.sum
            fillNumber(nowPeople, nowDuration, `one hour since ${renameTime(d.key)} on ${nowDate}`)
            d3.selectAll('.selected').classed('selected', false)
            d3.select(this).classed('selected', true)
        })

    enterdays.append('rect')
        .style('fill', '#748e76')
        .attr('class', d => `daily daily${Date.parse(d.key)}`)
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
        .on('mouseenter', d => {

            showDayName(new Date(d.key), nowDayName)

            nowPeople = d3.sum(d.values, e => e.value.people)
            nowDuration = d3.sum(d.values, e => e.value.sum)

            fillNumber(nowPeople, nowDuration, `one day on ${nowDate}`)
            d3.selectAll('.highlight').classed('highlight',false)

        })
        .on('click', d => {
            isOpen = true;
            prepareDay(new Date(d.key))
            drawDay(new Date(d.key), d.values)
        })

    let lable = svg.append('text')
        .attr('class', 'axisLable')
        .attr('transform', `translate(${w * .09 / 2 - 2},${dayH})`)
        .html(`<tspan x=0 dy=10 >Mins</tspan><tspan x=0 dy=10 >per day</tspan>`)


    // //Draw axis
    svg.append('g').attr('class', 'axis axis-y')
        .attr('transform', `translate(${w * .09 / 2},${dayH})`)
        .call(axisY);

    let cover = d3.select('#cover')
    cover.select('.loading').classed('hidden', true)
    cover.select('#explore').classed('hidden', false)
    cover.on('click', d => removeCover()).style('cursor', 'pointer')

}

function renameTime(time) {
    let newTime
    if (time > 12) {
        newTime = `${time - 12} pm`
    } else {
        newTime = `${time} am`
    }
    return newTime
}

function resetDay() {

    svg.selectAll('.sticker').style('fill', '#748e76').attr('height', 0)
    svg.selectAll('.selected').classed('selected', false)

}

function resetAll() {
    resetDay()
    svg.selectAll('.daily').style('fill', '#748e76')
    nowDayName.select('text').text('')
    nowDayContent.classed('hidden', true)
    isOpen = false;
    fillNumber(AllPeople, AllDuration, AllDate)

}


function showDayName(nowDayDate, item) {
    svg.selectAll('.daily').style('fill', '#748e76')
    const nowDayArray = nowDayDate.toUTCString().split(' ')
    const realPosition = scaleX(nowDayDate)
    const fixedPosition = (realPosition + oneW) > svgW ? (realPosition - oneW - 1) : realPosition
    nowDate = `${nowDayArray[2]}. ${+nowDayArray[1]}`
    item.select('.dayName').attr('transform', `translate(${fixedPosition},0)`)
        .text(nowDate)
        .attr('x', (realPosition + oneW) < svgW ? 0 : oneW)
        .attr('y', 15)
    svg.select(`.daily${Date.parse(nowDayDate)}`).style('fill', '#d3e0d1')
}

function prepareDay(nowDayDate) {
    resetDay();
    nowDayContent.classed('hidden', false)
    svg.select(`#dayGroup${Date.parse(nowDayDate)}`).selectAll('circle').classed('selected', true)

    svg.select(`#id${Date.parse(nowDayDate)}`).attr('height', oneH + dayH * .6).style('fill', '#d3e0d1')
    const realPosition = scaleX(nowDayDate)
    const fixedPosition = (realPosition + oneW) > svgW ? (realPosition - oneW - 1) : realPosition

    nowDayTable.attr('transform', `translate(${fixedPosition},0)`)

    showDayName(nowDayDate, nowDayContent)

    nowDayContent.select('.dayTitle')
        .attr('x', oneW / 2)
        .attr('y', dayH * 2)
    nowDay.node().parentNode.appendChild(nowDay.node())
}

function fillNumber(people, duration, date) {

    let numbers = getNumber(duration);
    document.querySelector('#date').innerHTML = date;
    document.querySelector('#people').innerHTML = people.toLocaleString();
    document.querySelector('#duration').innerHTML = Math.floor(duration / 60).toLocaleString();
    document.querySelector('#calories').innerHTML = Math.floor(numbers[0]).toLocaleString()
    document.querySelector('#co2').innerHTML = Math.floor(numbers[1]).toLocaleString()

}

function getNumber(duration) {
    const calories = duration * 204 / 3600;
    const co2 = duration / 2400 * 9.3 * 411;

    return [calories, co2]
}


function drawDay(nowDayDate, data) {
    oneDay.selectAll('.hours').remove()
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

    nowPeople = d3.sum(data, d => d.value.people)
    nowDuration = d3.sum(data, d => d.value.sum)
    fillNumber(nowPeople, nowDuration, `one day on ${nowDate}`)


    var updateOnehour = oneDay.selectAll('.hours').data(onedayData, d => d.hour)

    var enterOnehour = updateOnehour.enter().append('g').attr('class', 'hours')
        .attr('transform', d => `translate(0,${scaleY(d.hour) + dayH})`)


    var updateOne = enterOnehour.selectAll('.onecircle')
        .data(d => d.data)

    var enterOne = updateOne.enter().append('circle')
        .attr('class', 'onecircle')
        .attr('r', 1.5)
        .attr('cx', fixedPosition)
        .style('stroke-width', .5)
        .style('fill-opacity', .2)
        .style('fill', '#afaeae')
        .style('stroke', '#afaeae')
        .attr('id', d => `id${d.key}${d.values[0].start_hour}`)

    updateOnehour.exit().remove()

    updateOnehour.merge(enterOnehour).attr('transform', d => `translate(0,${scaleY(d.hour) + dayH})`)

    updateOne
        .merge(enterOne)
        .attr('cx', fixedPosition)
        .transition().duration(2000)
        .attr('cx', d => scaleoneX(+d.key))

    svg.select('.axis-x').attr('transform', d => `translate(0,${oneH + dayH * 1.6})`).call(axisSmallX);

}



function parse(d) {
    var date = new Date(d['starttime'].replace(/-/g, "/"));
    var refDate = new Date(date)
    var day = new Date(refDate.setHours(0, 0, 0))

    if (+d.tripduration > 7200 || +d.tripduration < 300) return
    return {
        start_at: date,
        start_hour: date.getHours(),
        start_day: day,
        duration: +d.tripduration,
    }
}