var file = '../data/trip.csv';
var w = window.innerWidth,
    h = window.innerHeight;

// var nowSeason = document.querySelector('#nowSeason');
var svg = d3.select('#canvas').append('svg').attr('width', w - 15).attr('height', h)

var seasonPoint = [
    { name: 'spring', range: [3, 4, 5], color: '#abdda4', order: 1 },
    { name: 'summer', range: [6, 7, 8], color: '#d7191c', order: 2 },
    { name: 'autumn', range: [9, 10, 11], color: '#fdae61', order: 3 },
    { name: 'winter', range: [12, 1, 2], color: '#2b83ba', order: 4 }
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

d3.queue()
    .defer(d3.csv, file, parse)
    .await(dataloaded);

function dataloaded(err, trips) {
    console.log(trips)
    // console.log(d3.extent(trips, d => d.starttime))
    // console.log(d3.extent(trips, d => d.duration))
    // console.log(d3.extent(trips,d => d.mon))


    //CASE 1:
    // var scaleX = d3.scaleLinear().domain(d3.extent(trips, d => d.starttime)).range([10, w - 20])
    // var scaleY = d3.scaleLinear().domain(d3.extent(trips, d => d.duration)).range([h - 20, 10])
    // svg.selectAll('circle').data(trips).enter()
    // .append('circle').attr('r', 1).attr('cx', d => scaleX(d.starttime)).attr('cy', d => scaleY(d.duration))
    // .style('fill', d => d.mon).style('opacity', .6)

    //CASE 2:
    // var scaleX = d3.scaleLinear().domain(d3.extent(trips, d => d.starttime)).range([10, w - 20])
    // var scaleY = d3.scaleLinear().domain(d3.extent(trips, d => d.start_at)).range([h - 20, 10])
    // var scaleR = d3.scaleLinear().range([1, 10])
    // var scaleOpacity = d3.scaleLinear().range([.1, 1])
    // var scaleColor = d3.scaleLinear().range(['red', 'blue'])
    // var tripsBynest = d3.nest()
    //     .key(d => d.id)
    //     .entries(trips)
    // console.log(tripsBynest)
    // scaleR.domain(d3.extent(tripsBynest.map(d => d.values.length)))
    // scaleColor.domain(d3.extent(tripsBynest.map(d => d3.mean(d.values, n => n.duration))))
    // console.log(d3.extent(tripsBynest.map(d => d3.mean(d.values, n => n.duration))))
    // svg.selectAll('circle').data(tripsBynest).enter()
    //     .append('circle').attr('r', d => scaleR(d.values.length))
    //     .attr('cx', d => scaleX(d.values[0].starttime))
    //     .attr('cy', d => scaleY(d.values[0].start_at))
    //     // .style('fill', 'grey')
    //     .style('fill', d => scaleColor(d3.mean(d.values, n => n.duration)))
    //     .style('opacity', .3)
    // CASE 3:
    //     var tripsBynest = d3.nest()
    //     .key(d => d.id)
    //     .entries(trips)
    // console.log(tripsBynest)
    // var scaleR = d3.scaleLinear().range([10, 70]).domain(d3.extent(tripsBynest.map(d => d.values.length)))
    // var scaleColor = d3.scaleLinear().range(['red', 'blue']).domain(d3.extent(tripsBynest.map(d => d3.mean(d.values, n => n.duration))))
    // svg.selectAll('circle').data(tripsBynest).enter()
    //     .append('circle').attr('r', d => scaleR(d.values.length))
    //     .attr('cx', d => d.values[0].day * w / 7 + 70)
    //     .attr('cy', d => d.values[0].season * h / 4 - 35)
    //     .style('fill', '#ccc')
    //     .style('fill', d => scaleColor(d3.mean(d.values, n => n.duration)))
    //     .style('opacity', .3)

}
// CASE 3:
// function parse(d) {
//     var date = new Date(d['starttime'].replace(/-/g, "/"));
//     var refDate = new Date(date)
//     var day = date.getDay()
//     var season = seasonPoint.find(e => e.range.includes(date.getMonth() + 1)).order
//     if (+d.tripduration > 3600 || +d.tripduration < 300) return
//     return {
//         season: season,
//         day: +day,
//         id: `${season}+${day}`,
//         duration: +d.tripduration,
//     }
// }
//CASE 2:
// function parse(d) {
//     var date = new Date(d['starttime'].replace(/-/g, "/"));
//     var refDate = new Date(date)
//     var day = new Date(refDate.setHours(0, 0, 0))
//     if (+d.tripduration > 3600 || +d.tripduration < 300) return
//     return {
//         start_at: date.getHours(),
//         starttime: day,
//         id: `${date.getHours()}+${day}`,
//         duration: +d.tripduration,
//     }
// }
//CASE 1: filter out same duration in same season
// function parse(d) {
//     var date = new Date(d['starttime'].replace(/-/g, "/"));
//     var refDate = new Date(date)
//     var mon = date.getMonth() + 1
//         if (+d.tripduration > 3600 || +d.tripduration < 300) return
//     if (!durations.has(`${d.tripduration}+${mon}`)) {
//         durations.add(`${d.tripduration}+${mon}`);
//     } else{return}

//     return {
//         //start_at: date.getTime(),
//         starttime: date.getTime() - new Date(refDate.setHours(0, 0, 0)),
//         // starttime: date.getHours(),
//         mon: seasonPoint.find(e => e.range.includes(mon)).color,
//         // mon: mon,
//         duration: +d.tripduration,
//     }
// }