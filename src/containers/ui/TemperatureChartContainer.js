/* eslint-disable arrow-body-style */
import { connect } from 'react-redux'
import { temperaturesFetchData } from '../../actions/index'
import TemperatureChartView from "../../components/ui/TemperatureChartView";
import { SmoothLine } from 'react-native-pathjs-charts'
import {getCurrentYear} from "../../utils/methods";

const mapStateToProps = (state, ownProps) => {
    return {
        temperatures: state.getTemperatures,
        hasErrored: state.temperaturesHaveErrored,
        isLoading: state.temperaturesAreLoading,
        homeRefreshing: ownProps.homeRefreshing,
        chartType: SmoothLine
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        getData: (subparameters) => dispatch(temperaturesFetchData('/temperature/year/'+getCurrentYear())),
        homeRefreshed: ownProps.homeRefreshed
    }
};

const TemperatureChartContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(TemperatureChartView);

export default TemperatureChartContainer