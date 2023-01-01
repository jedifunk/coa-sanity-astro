import Chart from 'chart.js/auto'
  
const MONTHS = [
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
const CoaColors = [
  'hsla(199, 100%, 30%, 1)',
  'hsla(199, 100%, 35%, 1)',
  'hsla(199, 100%, 40%, 1)',
  'hsla(199, 100%, 45%, 1)',
  'hsla(199, 100%, 50%, 1)',
  'hsla(199, 100%, 55%, 1)',
  'hsla(199, 100%, 60%, 1)',
  'hsla(199, 100%, 65%, 1)',
  'hsla(199, 100%, 70%, 1)',
  'hsla(199, 100%, 75%, 1)',
]

function color(index) {
  return CoaColors[index % CoaColors.length];
}
function transparentize(value, opacity) {
  var alpha = opacity === undefined ? 0.5 : 1 - opacity;
  return colorLib(value).alpha(alpha).rgbString();
}

const daysTraveled = document.getElementById('dT')
const transport = document.getElementById('transport')
const transT = document.getElementById('transT')
const accom = document.getElementById('accommodation')
const accomT = document.getElementById('accomT')


const dT = new Chart(daysTraveled, {
  type: 'bar',
  responsive: true,
  data: {
    labels: MONTHS,
    datasets: [{
      label: 'Days',
      data: [15,13,10,5,9,7,13,5,4,4],
      backgroundColor: 'hsla(199,100%,30%,1)',
      borderRadius: 5,
    }],
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Travel Days Per Month',
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 20,
        ticks: {
          stepSize: 5,
        },
      }
    },
  }
})

const transportChart = new Chart(transport, {
  type: 'pie',
  responsive: true,
  options: {
    plugins: {
      legend: {
        position: 'left',
        title: {
          display: true,
          text: 'Modes of Transport',
        },
      },
    },
  },
  data: {
    labels: ['Airplane', 'Train', 'Boat', 'Bus', 'Car'],
    datasets: [{
      data: [11,34,9,19,15],
      backgroundColor: CoaColors,
    }]
  }
})

const transM = [
  {
    label: 'Airplane',
    data: [2,2,1,0,0,1,0,0,4,1],
    cubicInterpolationMode: 'monotone',
    fill: true,
    backgroundColor: 'hsla(199,100%,30%,.5)',
  },
  {
    label: 'Train',
    data: [5,6,0,0,0,6,12,6,0,0],
    cubicInterpolationMode: 'monotone',
    fill: true,
    backgroundColor: 'hsla(199,100%,40%,.5)',
  },
  {
    label: 'Boat',
    data: [0,0,6,1,1,0,0,0,0,0],
    cubicInterpolationMode: 'monotone',
    fill: true,
    backgroundColor: 'hsla(199,100%,50%,.5)',
  },

  {
    label: 'Bus',
    data: [0,0,4,5,8,0,1,0,0,3],
    fill: true,
    cubicInterpolationMode: 'monotone',
    backgroundColor: 'hsla(199,100%,60%,.5)',
  },
  {
    label: 'Car',
    data: [8,5,1,0,1,0,1,0,0,0],
    cubicInterpolationMode: 'monotone',
    fill: true,
    backgroundColor: 'hsla(199,100%,70%,.5)',
  }
]

const transOverTime = new Chart (transT, {
  type: 'line',
  responsive: true,
  data: {
    labels: MONTHS,
    datasets: transM,
  },
  options: {
    plugins: {
      legend: {
        title: {
          display: true,
          text: 'Transport Used Per Month',
        },
      },
    },
    scales: {
      // x: {
      //   stacked: true,
      // },
      y: {
        //stacked: true,
        // max: 15,
        // ticks: {
        //   stepSize: 5,
        // }
      },
    }
  }
})
const polar = new Chart(accom, {
  type: 'pie',
  responsive: true,
  options: {
    plugins: {
      legend: {
        position: 'left',
        title: {
          display: true,
          text: 'Accommodations Used',
        },
      },
    },
  },
  data: {
    labels: ['Hostel', 'Hotel', 'Apartment', 'Friend', 'Guesthouse', 'Room in Home'],
    datasets: [{
      data: [20,10,18,3,11,3],
      backgroundColor: CoaColors,
    }]
  },
})

const accomN = document.getElementById('accomN')
const accomTotal = new Chart (accomN, {
  type: 'pie',
  responsive: true,
  data: {
    labels: ['Hostel','Hotel','Apartment','Friend','Guesthouse','Room in Home'],
    datasets: [{
      data: [85,22,106,33,40,18],
      backgroundColor: CoaColors,
    }],
  },
  options: {
    plugins: {
      legend: {
        position: 'left',
        title: {
          display: true,
          text: 'Total Nights',
        },
      },
    },
  },
})

const accomM = [
  {
    label: 'Hostel',
    data: [2,4,2,2,4,2,1,0,2,0]
  },
  {
    label: 'Hotel',
    data: [4,3,0,0,0,0,0,0,1,2]
  },
  {
    label: 'Apartment',
    data: [3,0,2,1,1,4,6,1,0,0]
  },
  {
    label: 'Friends',
    data: [1,2,0,0,0,0,0,0,0,1]
  },
  {
    label: 'Guesthouse',
    data: [0,0,3,1,2,1,3,1,0,0]
  },
  {
    label: 'Room in Home',
    data: [0,0,0,0,0,0,1,0,1,1]
  },
]

const accomD = [
  {
    label: 'Hostel',
    data: [3,21,9,7,17,6,3,0,19,0],
    cubicInterpolationMode: 'monotone',
    fill: true,
    backgroundColor: 'hsla(199,100%,30%,.5)',
  },
  {
    label: 'Hotel',
    data: [5,4,0,0,0,0,0,0,5,8],
    cubicInterpolationMode: 'monotone',
    fill: true,
    backgroundColor: 'hsla(199,100%,40%,.5)',
  },
  {
    label: 'Apartment',
    data: [11,0,12,11,11,15,16,30,0,0],
    cubicInterpolationMode: 'monotone',
    fill: true,
    backgroundColor: 'hsla(199,100%,50%,.5)',
  },
  {
    label: 'Friends',
    data: [7,8,0,0,0,0,0,0,0,18],
    cubicInterpolationMode: 'monotone',
    fill: true,
    backgroundColor: 'hsla(199,100%,60%,.5)',
  },
  {
    label: 'Guesthouse',
    data: [0,0,13,11,2,5,8,1,0,0],
    cubicInterpolationMode: 'monotone',
    fill: true,
    backgroundColor: 'hsla(199,100%,70%,.5)',
  },
  {
    label: 'Room in Home',
    data: [0,0,0,0,0,0,6,0,7,5],
    cubicInterpolationMode: 'monotone',
    fill: true,
    backgroundColor: 'hsla(199,100%,80%,.5)',
  },
]

const accomOverTime = new Chart (accomT, {
  type: 'line',
  data: {
    labels: MONTHS,
    datasets: accomD,
  },
  options: {
    plugins: {
      legend: {
        title: {
          display: true,
          text: 'Days in Accommodation Per Month',
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        //stacked: true,
        max: 31,
      },
    },
  }
})

const direction = new Chart (dir, {
  type: 'radar',
  responsive: true,
  options: {
    scales: {
      r: {
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
    },
  },
  data: {
    labels: ['N','NE','E','SE','S','SW','W','NW'],
    datasets: [
      {
        label: 'Direction',
        data: [18,4,16,7,24,2,8,6],
        backgroundColor: CoaColors,
      },
    ],
  },
})

const exercise = document.getElementById('exercise')

const ex = new Chart(exercise, {
  responsive: true,
  data: {
    labels: MONTHS,
    datasets: [
      {
        type: 'line',
        yAxisID: 'y1',
        label: 'steps',
        data: [14347,16830,16115,11567,10541,14655,14031,10488,13667,10140],
        borderColor: 'hsla(199,100%,30%,1)',
        backgroundColor: 'hsla(199,100%,30%,1)',
      },
      {
        type: 'bar',
        yAxisID: 'y2',
        label: 'miles',
        data: [7.4,8.7,8.7,6.1,5.4,7.8,7.4,5.7,7.1,5.3],
        backgroundColor: 'hsla(199,100%,60%,.75)',
        borderRadius: 5,
      },
    ]
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Average Daily Exercise',
      },
    },
    scales: {
      'y1': {
        type: 'linear',
        position: 'left',
      },
      'y2': {
        type: 'linear',
        position: 'right',
      }
    }
  }
})

const media = document.getElementById('media')
const mC = new Chart (media, {
  type: 'bar',
  responsive: true,
  data: {
    labels: MONTHS,
    datasets: [
      {
        label: 'Photos',
        data: [598,467,542,282,510,706,708,339,703,251],
        borderRadius: 5,
        backgroundColor: 'hsla(199,100%,30%,1)',
      },
    ],
  },
})

const blog = document.getElementById('blog')
const bC = new Chart (blog, {
  responsive: true,
  data: {
    labels: MONTHS,
    datasets: [
      {
        type: 'bar',
        yAxisID: 'y1',
        // xAxisID: 'x1',
        label: 'Avg Words Per Post',
        data: [535.6666667,1054.4,1479.2,1568.25,1105,1908,2111,1611.5,938.25,1195],
        backgroundColor: 'hsla(199,100%,30%,.75)',
        borderRadius: 5,
      },
      {
        type: 'bar',
        yAxisID: 'y1',
        // xAxisID: 'x1',
        label: 'Total Words',
        data: [1607,5272,7396,6273,2210,3816,4222,6446,3753,1195],
        backgroundColor: 'hsla(199,100%,60%,.5)',
        borderRadius: 5,
      },
      {
        type: 'line',
        label: 'Posts',
        data: [3,5,8,5,2,2,2,4,5,1],
        borderColor: 'hsla(199,100%,30%,1)',
        yAxisID: 'y2',
        cubicInterpolationMode: 'monotone',
        order: 1,
        // xAxisID: 'x2',
      }
    ],
  },
  options: {
    scales: {
      x: {
        stacked: true
      },
      'y2': {
        display: false,
        //stacked: true
      }
    }
  }
})