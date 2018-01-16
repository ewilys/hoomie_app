/**
 Created by Guillaume Ferron on the 10/24/2017
 **/

import React, { Component } from 'react';
import {Text, View} from "react-native";
import PropTypes from 'prop-types';
import {chartOptions, colors, serverIp} from "../../utils/constants"
import {dateStrToInt, getCurrentDay, getCurrentMonth, getCurrentYear} from "../../utils/methods"
import MeanValue from "./MeanValue";
import { AreaChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape'
import UndefinedChart from "./UndefinedChart";
import {LinearGradient, Stop} from "react-native-svg";
const Dimensions = require('Dimensions');

class TemperatureChart extends Component {
    constructor(props) {
        super(props);

        this.state={
            temperatures: [],
            isLoading: false,
            hasErrored: false,
            updates : false,
        };

        this.chartStyle = {
            flex:1,
            flexDirection: 'column',
            alignContent: 'center'
        };

        this.headerStyle = {
            flex :1,
            flexDirection: 'row',
            justifyContent: 'space-between',
        };

        this.chartTitleStyle = {
            flex:1,
            color: colors.HOOMIE_COLOR,
            fontSize: 15,
            fontWeight: '100',
            marginLeft: 30
        };

        this.updatedChartOptions = chartOptions;
        // this.updatedChartOptions.width = Dimensions.get('window').width - 10;
        // this.updatedChartOptions.height = 0.4 * Dimensions.get('window').height;
    }

    componentDidMount() {
        this.temperaturesFetchData();
    }

    componentWillReceiveProps(nextProps) {
        if((!this.props.homeRefreshing && nextProps.homeRefreshing) || (this.props.room && nextProps.room && this.props.room !== nextProps.room) || (this.props.fetchingDate !== nextProps.fetchingDate)) {
            this.setState({
                updates:true,
            });
            //this.temperaturesFetchData();
        }
        else{
            this.setState({
                updates:false,
            })
        }
    }

    componentDidUpdate(){
        if(this.state.updates){
            this.temperaturesFetchData();
            this.setState({updates:false});
        }

    }

    getFetchingAddress() {
        let fetchingAddress = "";
        if(this.props.admin) {
            fetchingAddress += "/admin/temperature/average"+this.props.period[0].toUpperCase() + this.props.period.slice(1)+"/";
            switch(this.props.period) {
                case "year":
                    fetchingAddress += this.props.fetchingDate.split("-")[0];
                    break;
                case  "month":
                    fetchingAddress += this.props.fetchingDate.split("-")[0] + "-" + this.props.fetchingDate.split("-")[1];
                    break;
                case "day":
                    fetchingAddress += this.props.fetchingDate;
                    break;
            }
            fetchingAddress += "/"+this.props.room
        }
        else {
            fetchingAddress += "/"+this.props.room+"/temperature/"+this.props.period+"/";
            switch(this.props.period) {
                case "year":
                    fetchingAddress += this.props.fetchingDate.split("-")[0];
                    break;
                case  "month":
                    fetchingAddress += this.props.fetchingDate.split("-")[0] + "-" + this.props.fetchingDate.split("-")[1];
                    break;
                case "day":
                    fetchingAddress += this.props.fetchingDate;
                    break;
            }
        }

        return fetchingAddress;
    }

    temperaturesFetchData(subparameters) {
        let fetchingAddress = this.getFetchingAddress();
        fetch(`http://${serverIp}` + fetchingAddress)
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                this.temperaturesAreLoading();

                return response;
            })
            .then((response) => response.json())
            .then((temperatures) => this.temperaturesFetchSuccess(temperatures, subparameters))
            .catch(() => this.temperaturesHaveErrored());
    }

    temperaturesFetchSuccess(temperatures, subparameters) {
        this.setState({
            temperatures: TemperatureChart.dataToChart(temperatures.data),
            isLoading: false,
            hasErrored: false
        });

        this.props.homeRefreshed();
    }

    temperaturesAreLoading() {
        this.setState({
            isLoading: true
        })
    }


    temperaturesHaveErrored() {
        this.setState({
            hasErrored: true
        });
    }

    errorTimeOut(subparameters) {
        // We return a function instead of an action object
        return (dispatch) => {
            setTimeout(() => {
                // This function is able to dispatch other action creators
                dispatch(this.temperaturesHaveErrored());
            }, 5000);
        };
    }

    /**
     * Convert the temperatures received from server to exploitable data for the graphs
     *
     * @param temperatures = the temperatures received from server
     */
    static dataToChart(temperatures) {
        let chartData = [];
        let chartPoint = {temperature: 0};
        //Checks that temperatures have values
        if(temperatures && temperatures.length > 0) {
            //Iterate through the temperatures
            for (let tempIndex = 0; tempIndex < temperatures.length; tempIndex++) {
                chartPoint.temperature = Math.round( temperatures[tempIndex].value * 10) / 10;
                chartData.push(chartPoint.temperature);
            }
        }
        return chartData;
    }

    render() {
        if(this.state.temperatures && this.state.temperatures[0] && !this.state.isLoading) {
            return (
                <View style={this.chartStyle}>
                    <View style={this.headerStyle}>
                        <Text style={this.chartTitleStyle}>{this.props.chartTitle ? this.props.chartTitle : ''}</Text>
                        <MeanValue values={this.state.temperatures} unit="°C"/>
                    </View>
                    <AreaChart dataPoints={this.state.temperatures}
                               style={chartOptions}
                               contentInset={ { top: 30, bottom: 30 } }
                               curve={shape.curveNatural}
                               renderGradient={ ({ id }) => (
                                   <LinearGradient id={ id } x1={ '0%' } y={ '0%' } x2={ '0%' } y2={ '100%' }>
                                       <Stop offset={ '0%' } stopColor={ 'rgb(233, 86, 95)' } stopOpacity={ 0.8 }/>
                                       <Stop offset={ '100%' } stopColor={ 'rgb(255, 255, 255)' } stopOpacity={ 0.2 }/>
                                   </LinearGradient>
                               ) }
                               showGrid={false}
                    />
                </View>
            );
        } else {
            return(<UndefinedChart period={this.props.period}/>);
        }
    }
}

TemperatureChart.propTypes = {
    room: PropTypes.string.isRequired,
    period: PropTypes.string.isRequired,
    fetchingDate: PropTypes.string.isRequired,
    chartTitle: PropTypes.string,
    homeRefreshing: PropTypes.bool,
    homeRefreshed: PropTypes.func,
    admin: PropTypes.bool,
};

export default TemperatureChart;