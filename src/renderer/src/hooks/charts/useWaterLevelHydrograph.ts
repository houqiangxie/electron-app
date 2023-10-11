import * as echarts from 'echarts';
class WaterLevelHydrograph {
  refDom: any;
  data: any;
  chartInstance: any;
  option: any;
  markLineMap: any;
  constructor() {
    this.markLineMap = new Map([
      ['jhhsw', { value: '校核洪水位', color: '#FCAB38' }],
      ['xxsw', { value: '汛限水位', color: '#C3FF36' }],
      ['ssw', { value: '死水位', color: '#40FF91' }],
    ]);
  }
  init(refDom: any, data: any) {
    this.refDom = refDom;
    this.data = data;
    this.initOption();
    this.initChart();
  }
  initOption() {
    this.option = {
      color: ['#43C4FA', '#FCAB38', '#C3FF36', '#40FF91'],
      grid: {
        left: '10%',
        right: '10%',
      },
      tooltip: {
        trigger: 'item',
        borderColor: '#8b8b8b',
        backgroundColor: '#8b8b8b',
        textStyle: {
          color: '#FFF',
        },
      },
      legend: {
        icon: 'rect',
        itemHeight: 2,
        right: 10,
        data: [
          {
            name: '当前水位',
            textStyle: {
              color: '#43C4FA',
            },
          },
          {
            name: '校核洪水位',
            textStyle: {
              color: '#FCAB38',
            },
          },
          {
            name: '汛限水位',
            textStyle: {
              color: '#C3FF36',
            },
          },
          {
            name: '死水位',
            textStyle: {
              color: '#40FF91',
            },
          },
        ],
      },
      xAxis: {
        show: true,
        type: 'category',
        interval: 1,
        name: '时间(h)',
        axisLabel: {
          show: false, //刻度线
        },
        axisTick: {
          show: false,
        },
        nameTextStyle: {
          color: '#FFF',
          fontSize: 16,
        },
      },
      yAxis: {
        type: 'value',
        name: '水位(m)',
        min: this.getMaxMinYValue().minY,
        max: this.getMaxMinYValue().maxY,
        nameTextStyle: {
          color: '#FFF',
          fontSize: 16,
        },
        axisLabel: {
          color: '#FFF',
          fontSize: 16,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255,255,255,0.4)',
          },
        },

        axisLine: {
          show: false,
        },
      },
      dataset: this.data.dataset.value,

      series: [
        {
          name: '当前水位',
          type: 'line',
          zlevel: 12,
          smooth: false, //是否平滑曲线显示
          symbolSize: 0.1,
          label: {
            show: false,
            position: 'top',
            textStyle: {
              color: '#fff',
            },
          },
          tooltip: {
            show: true,
            formatter: (params: any) => {
              return `
              <div style="width: 100%">
                <div style="margin-bottom:5px;">
                  时间：${params.data[0]}
                </div>
                <div>
                水位：${params.data[1]}m</div>
              </div>`;
            },
          },
          emphasis: {
            disabled: false,
            itemStyle: {
              color: '#fff',
              width: 7,
              borderColor: '#43C4FA',
              borderWidth: 2,
            },
          },
        },
        ...this.getMarkLine(),
      ],
    };
  }
  initChart() {
    this.chartInstance = echarts.init(this.refDom.value);
    this.chartInstance.setOption(this.option);
  }
  getMarkLine() {
    const markLines: object[] = [];
    for (const key in this.data.otherInfo.value) {
      const { value: name } = this.markLineMap.get(key);
      const obj: object = {
        name,
        type: 'line',
        symbolSize: 0.1,

        markLine: {
          lineStyle: {
            type: 'dashed',
            width: 2,
          },
          label: {
            show: false,
          },
          tooltip: {
            show: true,
            formatter: (params: any) => {
              return `
              <div style="width: 100%">
                ${params.name}：${params.value}m
              </div>`;
            },
          },

          emphasis: {
            lineStyle: {
              type: 'solid',
              width: 3,
            },
          },
          data: [
            {
              name,
              symbol: 'none',
              yAxis: this.data.otherInfo.value[key],
            },
          ],
        },
      };
      markLines.push(obj);
    }
    return markLines;
  }
  getMaxMinYValue() {
    let maxY = 0,
      minY = 0;
    maxY = Math.ceil(Math.max(this.data.otherInfo.value.jhhsw, this.data.otherInfo.value.ssw, this.data.otherInfo.value.xxsw)) + 1;
    minY = Math.floor(Math.min(this.data.otherInfo.value.jhhsw, this.data.otherInfo.value.ssw, this.data.otherInfo.value.xxsw)) - 1;
    if (minY < 0) minY = 0;
    return { maxY, minY };
  }
  updateData() {
    this.initOption();
    this.chartInstance.setOption(this.option);
  }
  resizeChart() {
    this.initOption();
    this.chartInstance.setOption(this.option);
    this.chartInstance && this.chartInstance.resize();
  }
  destroyChart() {
    if (!this.chartInstance) {
      return;
    }
    this.chartInstance.clear();
    this.chartInstance.dispose();
    this.chartInstance = null;
    window.removeEventListener('resize', this.resizeChart);
  }
}

export default new WaterLevelHydrograph();
