import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import PastGraph from '../resources/PastGraph.js';
import Slider, { Range } from 'rc-slider';
// We can just import Slider or Range to reduce bundle size
// import Slider from 'rc-slider/lib/Slider';
// import Range from 'rc-slider/lib/Range';
import 'rc-slider/assets/index.css';
import Tooltip from 'rc-tooltip';

import { LinkContainer } from 'react-router-bootstrap';

class MeasurementCard extends Component {

	constructor(props){
		super(props);
		this.state = {hovered:false};
	}
	
	componentWillMount(){
//		console.log("in measurement card: ", this.props.data);
	}
	
	componentWillReceiveProps(nextProps){
	}

	componentDidMount(){

	}

	onMouseOver() {
      this.setState({ hovered:true });
    }

    onMouseOut() {
      this.setState({ hovered:false });
    }

    style() {
      if (this.state.hovered) {
        return { 
        	marginTop: '0.83em',
		    marginBottom: '0.83em',
		    marginLeft: '0',
		    marginRight: '0',
		    display: 'block',
    		fontSize: '1.5em',
        	fontWeight: "bold",
        	cursor:"pointer" }
      } else {
        return { 
        	marginTop: '0.83em',
		    marginBottom: '0.83em',
		    marginLeft: '0',
		    marginRight: '0',
		    display: 'block',
    		fontSize: '1.5em',
        	fontWeight: "normal",
        	cursor:"pointer" }
      }
    }

	onSlide(value){
//		console.log("huh:", this.props);
		this.props.onUpdate(value,this.props.code);
	}

	render(){

		const Handle = Slider.Handle;


		const handle = (props) => {
		  const { value, dragging, index, ...restProps } = props;
		  return (
		    <Tooltip
		      prefixCls="rc-slider-tooltip"
		      overlay={value}
		      visible={dragging}
		      placement="top"
		      key={index}
		    >
		      <Handle value={value} {...restProps} />
		    </Tooltip>
		  );
		};

		const firstSliderStyle = { float: 'left', height: 200, paddingLeft:"60px" };
		const secondSliderStyle = {
			"float":"right",
			float: 'left',
			height: 200,
			paddingLeft:"50px"
		}

		const marks = {
		  '-10': '-10°C',
		  0: <strong>0°C</strong>,
		  26: '26°C',
		  100: {
		    style: {
		      color: 'red',
		    },
		    label: <strong>100°C</strong>,
		  },
		};

		var link = "/measure/" + this.props.code;

		//console.log("this is the dataa?", this.props.data);
		return (
			<div className="panel panel-default container-fluid">
				<div className="row">
					<div className="col-sm-12" onMouseOver={this.onMouseOver.bind(this)} onMouseOut={this.onMouseOut.bind(this)} style={this.style()}>
						<LinkContainer to={link}><p>{this.props.title}</p></LinkContainer>
					</div>
				</div>
				<div className="row">
					<div className="col-sm-6">
						<PastGraph 
							obs_data={this.props.data}
							units={this.props.units}
							mainWidth={500}
							mainHeight={200}
							viewWidth={500}
							viewHeight={50}
						 />
					</div>
					<div className="col-sm-3">
						<div style={firstSliderStyle}>
							<Slider disabled vertical min={-10} max={20} handle={handle} defaultValue={5}/>
						</div>
					</div>
					<div className="col-sm-3">
						<div style={secondSliderStyle}>
							<Slider vertical min={-10} max={20} handle={handle} defaultValue={5} onChange={this.onSlide.bind(this)} />
						</div>
					</div>
				</div>
			</div>

		)

	}

}

export default MeasurementCard;



