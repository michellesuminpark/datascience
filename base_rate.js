/*
TODO
# Add textbox to enter percentages
# Add switch for test result
# When switch is on "positive", make the negative circles dim
# Escape quotes and apostrophes in input, test bugs
# Add formulas
*/

require.config({ 
    paths: { 
        d3src: 'https://d3js.org',
        slider: 'https://unpkg.com/d3-simple-slider@1.10.4/dist/d3-simple-slider.min'
    },
    map: {
        '*': {
            'd3': 'd3src/d3.v7.min',
            'd3-timer': 'd3src/d3-timer.v3.min',
            'd3-interpolate': 'd3src/d3-interpolate.v3.min',
            'd3-color': 'd3src/d3-color.v3.min',
            'd3-time': 'd3src/d3-time.v3.min',
            'd3-format': 'd3src/d3-format.v3.min',
            'd3-time-format': 'd3src/d3-time-format.v4.min',
            'd3-array': 'd3src/d3-array.v3.min',
            'd3-axis': 'd3src/d3-axis.v3.min',
            'd3-dispatch': 'd3src/d3-dispatch.v3.min',
            'd3-drag': 'd3src/d3-drag.v3.min',
            'd3-ease': 'd3src/d3-ease.v3.min',
            'd3-scale': 'd3src/d3-scale.v4.min',
            'd3-selection': 'd3src/d3-selection.v3.min',
            'd3-transition': 'd3src/d3-transition.v3.min'
        }
    }
})

var total = 1000
var prior = 0.5
var true_pos = 0.5
var true_neg = 0.5
var graphic_width = 850
var test_result = 0 // 0: unset, 1: pos, -1: neg
const pos_col = '#ffa600' // yellow orange
const neg_col = '#003f5c' // dark blue
const pos_col_dim = '#ffe4b3'
const neg_col_dim = '#b3e7ff'

function drawSlider1(d3, slider, svg) {
    let g = svg.append('g').attr('transform', 'translate(39, 20)')
    let s = slider.sliderBottom()
    g.call(
        s.min(0).max(1)
            .width(200)
            .tickFormat(d3.format('.1%'))
            .tickValues([0, 0.25, 0.5, 0.75, 1])
            .default(.5)
            .on('onchange', val => {
                true_pos = val
                drawCircles(d3, d3.select('#circles'))
                legendText(d3, d3.select('#legend'))
                d3.select('#input1').property('value', d3.format('.1f')(val * 100))
            })
    )
    return s
}

function drawSlider2(d3, slider, svg) {
    let g = svg.append('g').attr('transform', 'translate(39, 20)')
    let s = slider.sliderBottom()
    g.call(
        s.min(0).max(1)
            .width(200)
            .tickFormat(d3.format('.1%'))
            .tickValues([0, 0.25, 0.5, 0.75, 1])
            .default(.5)
            .on('onchange', val => {
                prior = val
                drawCircles(d3, d3.select('#circles'))
                legendText(d3, d3.select('#legend'))
                d3.select('#input2').property('value', d3.format('.1f')(val * 100))
            })
    )
    return s
}

function drawSlider3(d3, slider, svg) {
    let g = svg.append('g').attr('transform', 'translate(39, 20)')
    let s = slider.sliderBottom()
    g.call(
        s.min(0).max(1)
            .width(200)
            .tickFormat(d3.format('.1%'))
            .tickValues([0, 0.25, 0.5, 0.75, 1])
            .default(.5)
            .on('onchange', val => {
                true_neg = 1 - val
                drawCircles(d3, d3.select('#circles'))
                legendText(d3, d3.select('#legend'))
                d3.select('#input3').property('value', d3.format('.1f')(val * 100))
            })
    )
    return s
}

function drawCircles(d3, g, transition=false) {
    let col_len = 25
    let d = 17
    let data = []
    for (let i = 0; i < total; i++) {
        let r = 6
        let pos_neg_split = Math.round(total * prior)
        let is_pos = i < pos_neg_split
        let is_test_pos = is_pos ? i < Math.round(total * prior * true_pos) : i >= pos_neg_split + Math.round(total * (1-prior) * true_neg)
        let x = is_pos ? ((i / col_len) >> 0) * d + 20 : graphic_width - 20 - (((i - pos_neg_split) / col_len) >> 0) * d
        let y = is_pos ? (i % col_len) * d + 20 : ((i - pos_neg_split) % col_len * d + 20)
        let fill
        let stroke
        if (test_result == 0) {
            fill = is_pos ? pos_col : neg_col
            stroke = is_test_pos ? pos_col : neg_col
        } else if (test_result == 1) {
            fill = is_pos ? (is_test_pos ? pos_col : pos_col_dim) : (is_test_pos ? neg_col : neg_col_dim)
            stroke = is_test_pos ? pos_col : neg_col_dim
        } else if (test_result == -1) {
            fill = is_pos ? (is_test_pos ? pos_col_dim : pos_col) : (is_test_pos ? neg_col_dim : neg_col)
            stroke = is_test_pos ? pos_col_dim : neg_col
        }
        data[i] = [x, y, r, fill, stroke]
    }
    if (transition) {
        g.selectAll('circle')
            .data(data)
            .join('circle')
            .transition(d3.transition().duration(100).ease(d3.easeLinear))
            .attr('cx', function(d, i) {
                return d[0]
            })
            .attr('cy', function(d, i) {
                return d[1]
            })
            .attr('r', function(d, i) {
                return d[2]
            })
            .attr('fill', function(d, i) {
                return d[3]
            })
            .attr('stroke', function(d, i) {
                return d[4]
            })
            .attr('stroke-width', 2.2)
    } else {
        g.selectAll('circle')
            .data(data)
            .join('circle')
            .attr('cx', function(d, i) {
                return d[0]
            })
            .attr('cy', function(d, i) {
                return d[1]
            })
            .attr('r', function(d, i) {
                return d[2]
            })
            .attr('fill', function(d, i) {
                return d[3]
            })
            .attr('stroke', function(d, i) {
                return d[4]
            })
            .attr('stroke-width', 2.2)
    }
}

function drawLegend(d3, g) {
    let y = 500
    let r = 8
    let stroke_width = 2.2/6*8
    g.append('text')
        .attr('id', 'total_text')
        .attr('x', graphic_width/2)
        .attr('y', y-24)
        .attr('text-anchor', 'middle')
        .text('Out of ' + total + ', there are...')
    g.append('circle')
        .attr('cx', 50)
        .attr('cy', y)
        .attr('r', r)
        .attr('fill', pos_col)
        .attr('stroke', pos_col)
        .attr('stroke-width', stroke_width)
    g.append('circle')
        .attr('cx', 250)
        .attr('cy', y)
        .attr('r', r)
        .attr('fill', pos_col)
        .attr('stroke', neg_col)
        .attr('stroke-width', stroke_width)
    g.append('circle')
        .attr('cx', 450)
        .attr('cy', y)
        .attr('r', r)
        .attr('fill', neg_col)
        .attr('stroke', pos_col)
        .attr('stroke-width', stroke_width)
    g.append('circle')
        .attr('cx', 650)
        .attr('cy', y)
        .attr('r', r)
        .attr('fill', neg_col)
        .attr('stroke', neg_col)
        .attr('stroke-width', stroke_width)
}

function ppv() {
    return prior * true_pos / (prior * true_pos + (1-prior) * (1-true_neg))
}

function npv() {
    return (1-prior) * true_neg / ((1-prior) * true_neg + prior * (1-true_pos))
}

function legendText(d3, g) {
    let y = 506
    let a = Math.round(total * prior * true_pos)
    let b = Math.round(total * prior * (1-true_pos))
    let c = Math.round(total * (1-prior) * (1-true_neg))
    let d = Math.round(total * (1-prior) * true_neg)
    let data = [
        ['true_pos_text', 65, y, a + ((a == 1) ? ' true positive' : ' true positives'), 1],
        ['false_neg_text', 265, y, b + ((b == 1) ? ' false negative' : ' false negatives'), 1],
        ['false_pos_text', 465, y, c + ((c == 1) ? ' false positive' : ' false positives'), 1],
        ['true_neg_text', 665, y, d + ((d == 1) ? ' true negative' : ' true negatives'), 1],
    ]
    let ppv_npv = ['ppv_npv', 230, y+64, '', 0]
    if (test_result == 1) {
        let val = ppv()
        ppv_npv[3] = isNaN(val) ? 'Nothing tested positive!' : d3.format('.1%')(ppv()) + ' of those who tested positive are true positives'
        ppv_npv[4] = 1
    } else if (test_result == -1) {
        let val = npv()
        ppv_npv[3] = isNaN(val) ? 'Nothing tested negative!' : d3.format('.1%')(npv()) + ' of those who tested negative are true negatives'
        ppv_npv[4] = 1
    } else {
        if (!d3.select('#ppv_npv').empty()) {
            ppv_npv[3] = d3.select('#ppv_npv').text()
        }
    }
    data.push(ppv_npv)
    g.selectAll('.legend_text')
        .data(data)
        .join('text')
        .attr('id', function(d, i) {
            return d[0]
        })
        .attr('class', 'legend_text')
        .attr('x', function(d, i) {
            return d[1]
        })
        .attr('y', function(d, i) {
            return d[2]
        })
        .text(function(d, i) {
            return d[3]
        })
        .transition(d3.transition().duration(100).ease(d3.easeLinear))
        .style('opacity', function(d, i) {
            return d[4]
        })
}

function chooseResult(d3, g) {
    let x = 400
    let y = 540
    g.append('text')
        .text('Actual test result:')
        .attr('x', x-150)
        .attr('y', y)
    g.append('rect')
        .attr('id', 'pos_button')
        .attr('x', x-12)
        .attr('y', y-18)
        .attr('width', 80)
        .attr('height', 25)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('fill', '#f1f1f1')
        .attr('stroke-width', 2.5)
        .on('mouseover', function(d) {
            d3.select('#pos_button').attr('fill', pos_col_dim)
            d3.select('#pos_button_text').attr('fill', '#000')
        }).on('mousedown', function() {
            if (test_result == 1) {
                test_result = 0
                d3.select('#pos_button').attr('stroke', 'none')
            } else if (test_result == 0) {
                test_result = 1
                d3.select('#pos_button').attr('stroke', pos_col)
            } else if (test_result == -1) {
                test_result = 1
                d3.select('#pos_button').attr('stroke', pos_col)
                d3.select('#neg_button').attr('stroke', 'none')
                d3.select('#neg_button_text').attr('fill', '#777')
            }
            drawCircles(d3, d3.select('#circles'), true)
            legendText(d3, d3.select('#legend'))
        }).on('mouseleave', function(d) {
            d3.select('#pos_button').attr('fill', '#f1f1f1')
            if (test_result != 1) {
                d3.select('#pos_button_text').attr('fill', '#777')
            }
        })
    g.append('text')
        .attr('id', 'pos_button_text')
        .text('Positive')
        .attr('x', x)
        .attr('y', y)
        .attr('pointer-events', 'none')
        .attr('fill', '#777')
    x = 490
    g.append('rect')
        .attr('id', 'neg_button')
        .attr('x', x-9)
        .attr('y', y-18)
        .attr('width', 80)
        .attr('height', 25)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('fill', '#f1f1f1')
        .attr('stroke-width', 2.5)
        .on('mouseover', function(d) {
            d3.select('#neg_button').attr('fill', neg_col_dim)
            d3.select('#neg_button_text').attr('fill', '#000')
        }).on('mousedown', function() {
            if (test_result == 1) {
                test_result = -1
                d3.select('#neg_button').attr('stroke', neg_col)
                d3.select('#pos_button').attr('stroke', 'none')
                d3.select('#pos_button_text').attr('fill', '#777')
            } else if (test_result == 0) {
                test_result = -1
                d3.select('#neg_button').attr('stroke', neg_col)
            } else if (test_result == -1) {
                test_result = 0
                d3.select('#neg_button').attr('stroke', 'none')
            }
            drawCircles(d3, d3.select('#circles'), true)
            legendText(d3, d3.select('#legend'))
        }).on('mouseleave', function(d) {
            d3.select('#neg_button').attr('fill', '#f1f1f1')
            if (test_result != -1) {
                d3.select('#neg_button_text').attr('fill', '#777')
            }
        })
    g.append('text')
        .attr('id', 'neg_button_text')
        .text('Negative')
        .attr('x', x)
        .attr('y', y)
        .attr('pointer-events', 'none')
        .attr('fill', '#777')
}

function onInput(d3) {
    let q1_text = document.getElementById('q1').value
    let q2_text = document.getElementById('q2').value
    let command = 'toJS("' + q1_text + '","' + q2_text + '")'
    IPython.notebook.kernel.execute(command)
}

function makeTooltip(d3, container, element, f) {
    element
        .on('mouseover', function(d) {
            d3.json('base_rate.json').then(function(e) {
                let t = f(e)
                if (t != '') {
                    d3.select('#my_tooltip').text(t)
                        .transition(d3.transition().duration(100).ease(d3.easeLinear))
                        .style('opacity', 1)
                }
            })
        }).on('mousemove', function(d) {
            d3.select('#my_tooltip')
                .style('left', (d3.pointer(d, container)[0]-24) + 'px')
                .style('top', (d3.pointer(d, container)[1]+20) + 'px')
        }).on('mouseleave', function(d) {
            d3.select('#my_tooltip')
                .transition(d3.transition().duration(100).ease(d3.easeLinear))
                .style('opacity', 0)
        })
}

function validatePercentage(val) {
    return /^(100|(\d|\d\d)(|\.\d*))$/.test(val)
}

require.undef('viz')
define('viz', ['d3', 'slider'], function(d3, slider) {
    function draw(container) {
        d3.select(container).append('div').attr('id', 'questions')
        d3.select(container).append('div').attr('id', 'my_tooltip')
        d3.select('#questions').append('label').attr('for', 'q1').text('What is the question you are trying to answer?').style('margin-right', '20px')
        d3.select('#questions').append('input').attr('type', 'text').attr('id', 'q1').attr('name', 'q1').attr('placeholder', 'e.g. Do I have Covid? Is Jack the killer?').style('width', '500px')
        d3.select('#q1').on('input', function() {
            onInput(d3)
        })
        d3.select('#questions').append('br')
        d3.select('#questions').append('label').attr('for', 'q2').text('What is the test you are performing?').style('margin-right', '20px')
        d3.select('#questions').append('input').attr('type', 'text').attr('id', 'q2').attr('name', 'q2').attr('placeholder', 'e.g. PCR test').style('width', '200px')
        d3.select('#q2').on('input', function() {
            onInput(d3)
        })
        onInput(d3)

        d3.select(container).append('div').attr('id', 'sliders')
        d3.select('#sliders').append('div').attr('id', 'slider1')
        d3.select('#sliders').append('div').attr('id', 'slider2')
        d3.select('#sliders').append('div').attr('id', 'slider3')
        let sl1 = d3.select('#slider1').append('span').attr('class', 'slider_label').text('True positive rate:')
        let s1_input = d3.select('#slider1').append('input')
            .attr('id', 'input1')
            .attr('class', 'pc_input')
            .attr('type', 'number')
            .attr('step', 0.1)
            .attr('value', true_pos * 100)
        d3.select('#slider1').append('span').attr('class', 'slider_label').text('%')
        makeTooltip(d3, container, sl1, (e) => {return 'If ' + e.statement + ', how likely would the ' + e.test + ' correctly turn up positive?'})
        let sl2 = d3.select('#slider2').append('span').attr('class', 'slider_label').text('Prior probability:')
        let s2_input = d3.select('#slider2').append('input')
            .attr('id', 'input2')
            .attr('class', 'pc_input')
            .attr('type', 'number')
            .attr('step', 0.1)
            .attr('value', prior * 100)
        d3.select('#slider2').append('span').attr('class', 'slider_label').text('%')
        makeTooltip(d3, container, sl2, (e) => {return 'Before performing any tests, what is the prior probability that ' + e.statement + '?'})
        let sl3 = d3.select('#slider3').append('span').attr('class', 'slider_label').text('False positive rate:')
        let s3_input = d3.select('#slider3').append('input')
            .attr('id', 'input3')
            .attr('class', 'pc_input')
            .attr('type', 'number')
            .attr('step', 0.1)
            .attr('value', (1 - true_neg) * 100)
        d3.select('#slider3').append('span').attr('class', 'slider_label').text('%')
        makeTooltip(d3, container, sl3, (e) => {return 'If ' + e.statement_neg + ', how likely would the ' + e.test + ' incorrectly turn up positive?'})
        let svg_slider1 = d3.select('#slider1').append('svg').attr('width', '280px').attr('height', '70px')
        let s1 = drawSlider1(d3, slider, svg_slider1)
        s1_input.on('input', function() {
            let val = document.getElementById('input1').value
            if (validatePercentage(val)) {
                true_pos = String(val / 100)
                s1.silentValue(val / 100)
                drawCircles(d3, d3.select('#circles'))
                legendText(d3, d3.select('#legend'))
                d3.select('#input1').transition(d3.transition().duration(100).ease(d3.easeLinear)).style('background-color', '#fff')
            } else {
                d3.select('#input1').transition(d3.transition().duration(100).ease(d3.easeLinear)).style('background-color', '#ffcdd2')
            }
        })
        let svg_slider2 = d3.select('#slider2').append('svg').attr('width', '280px').attr('height', '70px')
        let s2 = drawSlider2(d3, slider, svg_slider2)
        s2_input.on('input', function() {
            let val = document.getElementById('input2').value
            if (validatePercentage(val)) {
                prior = String(val / 100)
                s2.silentValue(val / 100)
                drawCircles(d3, d3.select('#circles'))
                legendText(d3, d3.select('#legend'))
                d3.select('#input2').transition(d3.transition().duration(100).ease(d3.easeLinear)).style('background-color', '#fff')
            } else {
                d3.select('#input2').transition(d3.transition().duration(100).ease(d3.easeLinear)).style('background-color', '#ffcdd2')
            }
        })
        let svg_slider3 = d3.select('#slider3').append('svg').attr('width', '280px').attr('height', '70px')
        let s3 = drawSlider3(d3, slider, svg_slider3)
        s3_input.on('input', function() {
            let val = document.getElementById('input3').value
            if (validatePercentage(val)) {
                true_neg = 1 - String(val / 100)
                s3.silentValue(val / 100)
                drawCircles(d3, d3.select('#circles'))
                legendText(d3, d3.select('#legend'))
                d3.select('#input3').transition(d3.transition().duration(100).ease(d3.easeLinear)).style('background-color', '#fff')
            } else {
                d3.select('#input3').transition(d3.transition().duration(100).ease(d3.easeLinear)).style('background-color', '#ffcdd2')
            }
        })

        d3.select(container).append('div').attr('id', 'graphic')
        d3.select('#graphic').append('svg').attr('width', graphic_width).attr('height', '600px')
        let g_circles = d3.select('#graphic svg').append('g').attr('id', 'circles')
        let g_legend = d3.select('#graphic svg').append('g').attr('id', 'legend')
        drawCircles(d3, g_circles)
        drawLegend(d3, g_legend)
        legendText(d3, g_legend)
        chooseResult(d3, g_legend)
        let ppv_npv_text = d3.select('#ppv_npv')
        makeTooltip(d3, container, ppv_npv_text, (e) => {
            if (test_result == 1) {
                return 'Given that the ' + e.test + ' came back positive, the probability that ' + e.statement + ' is ' + d3.format('.1%')(ppv()) + '.'
            } else if (test_result == -1) {
                return 'Given that the ' + e.test + ' came back negative, the probability that ' + e.statement_neg + ' is ' + d3.format('.1%')(npv()) + '.'
            } else {
                return ''
            }
        })
    }
    return draw
})

// element.append('Loaded 🎉')