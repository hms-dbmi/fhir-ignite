import {calculateReynolds} from '../RiskCalculators/reynolds.js';
import {calcCHADScore} from '../RiskCalculators/CHAD.js';
import {calcKFRisk} from '../RiskCalculators/get_KFRisk.js';
import {calcCOPD} from '../RiskCalculators/COPD.js';
import {calcDiabetesRisk} from '../RiskCalculators/get_diabetes.js';
import React, { Component } from 'react';
import $ from 'jquery'; 
import {searchByCode, calculateAge, pullCondition} from '../utils/general_utils.js';
import SkyLight from 'react-skylight';

export class Diabetes extends Component {
	constructor(props) {
		super();
		this.state = {
			score: "..."
		};
	}

	componentDidMount() {
		var parentComponent = this;
		$.when(this.props.pt, this.props.obs, this.props.conds, this.props.medreq).done(function(pt, obs, conds, meds) {
			//calcDiabetesRisk(age, gender, bmi, hyperglycemia, historyOfAntihypDrugs, waist)
			var waist = pullCondition(obs, ['56115-9', '56114-2', '56117-5', '8280-0', '8281-8'])
			var bmi = pullCondition(obs, ['39156-5']);
			var hyperglycemia = pullCondition(conds, ['80394007']);
			if (waist.length == 0 || bmi.length == 0) {
				alert("Patient does not have sufficient measurements for Diabetes Risk Score.");
				console.log(bmi, waist);
				return;
			}
			var score = calcDiabetesRisk(calculateAge(pt[0].birthDate),
				pt[0].gender,
				bmi[0].valueQuantity.value,
				(hyperglycemia.length == 0),
				false, //NEEDS TO BE FIXED
				waist[0].valueQuantity.value);
			parentComponent.setState({
				score: score,
				sym: "%"
			});
		});
	}

	render() {
		var opacity = this.state.score/100;
		var link = window.location.origin.toString() + '/risk/Diabetes';
		return (
			<g>
				<a xlinkHref={link} target="_blank">
		    		<rect width="95%" height="95%" x="2.5%" y="2.5%" rx="20" ry="20" style={{fill:'red',stroke:'#888D95',strokeWidth:3,fillOpacity: opacity}}/>
	    		</a>
				<text x="50%" y="60%" fontSize="28" alignmentBaseline="middle" textAnchor="middle">{this.state.score}{this.state.sym}</text>
			</g>
		);
	}
}

export class COPD extends Component {
	constructor(props) {
		super();
		this.state = {
			score: "..."
		};
	}

	componentDidMount() {
		var parentComponent = this;
		$.when(this.props.pt, this.props.obs, this.props.conds).done(function(pt, obs, conds) {
			//calcCOPD(age, confusion, bun, rr, sbp, dbp)
			var confusion = pullCondition(conds, ["40917007"]); //could be reprogrammed for O(n) instead of O(n*m) if time
			var measurementObject = {
				'8480-6': [], //sysBP
				'8462-4': [], //diasBP
				'6299-2': [], //bun
				'9279-1': [] //rr
			};
			var sortedObs = searchByCode(obs, measurementObject);
			for (var key in sortedObs) {
				if(sortedObs.hasOwnProperty(key)) {
					if(sortedObs[key].length == 0) {
						alert("Patient does not have adequate measurements for COPD Risk Score.");
						console.log(sortedObs);
						return;
					}
				}
			}
			var COPDScore = calcCOPD(calculateAge(pt[0].birthDate),
				confusion,
				sortedObs['6299-2'][0].value,
				sortedObs['9279-1'][0].value,
				sortedObs['8480-6'][0].value,
				sortedObs['8462-4'][0].value);
			parentComponent.setState({
				score: COPDScore,
				sym: "%"
			});
		});
	}

	render() {
		var opacity = this.state.score/100;
		var link = window.location.origin + '/risk/COPD_Mortality';
		return (
			<g>
				<a xlinkHref={link} target="_blank">
		    	<rect width="95%" height="95%" x="2.5%" y="2.5%" rx="20" ry="20" style={{fill:'red',stroke:'#888D95',strokeWidth:3,fillOpacity: opacity}}/>
		    	</a>
				<text x="50%" y="60%" fontSize="28" alignmentBaseline="middle" textAnchor="middle">{this.state.score}{this.state.sym}</text>
			</g>
		);
	}
}

export class KFScore extends Component {
	constructor(props) {
		super();
		this.state = {
			score: "..."
		};
	}

	componentDidMount() {
		var parentComponent = this;
		$.when(this.props.pt, this.props.obs).done(function(pt, obs) {
			var gfr = pullCondition(obs, ["48643-1", "48642-3", "33914-3"]); //could be reprogrammed for O(n) instead of O(n*m) if time
			var uac = pullCondition(obs, ["14958-3", "14959-1"]);
			if(gfr.length == 0 || uac.length == 0) {
				alert("Patient does not have enough measurements for Kidney Risk Score");
				return;
			}
			else {
				if(gfr[0].component) {
					gfr[0] = gfr[0].component[0];
				}
				var KFRisk = calcKFRisk(pt[0].gender, 
				calculateAge(pt[0].birthDate), 
				gfr[0].valueQuantity.value, //gfr
				uac[0].valueQuantity.value); //uac
				parentComponent.setState({
					score: KFRisk,
					sym: "%"
				});
			}
		});
	}

	render() {
		var opacity = this.state.score/100;
		var link = window.location.origin + '/risk/Kidney_Failure';
		return (
			<g>
				<a xlinkHref={link} target="_blank">
		    		<rect width="95%" height="95%" x="2.5%" y="2.5%" rx="20" ry="20" style={{fill:'red',stroke:'#888D95',strokeWidth:3,fillOpacity: opacity}}/>
				</a>
				<text x="50%" y="60%" fontSize="28" alignmentBaseline="middle" textAnchor="middle">{this.state.score}{this.state.sym}</text>
			</g>
		);
	}
}

export class CHADScore extends Component {
	constructor(props) {
		super();
		this.state = {
			score: "..."
		};
	}

	componentDidMount() {
		var parentComponent = this;
		$.when(this.props.pt, this.props.conds).done(function(pt, conds) {
		    var chf = pullCondition(conds, ["42343007"]); //byCodes only works w LOINC
		    var hypertension = pullCondition(conds, ["38341003"]);
		    var vascDisease = pullCondition(conds, ["27550009"]);
		    var diabetes = pullCondition(conds, ["73211009"]);
		    var strTIAthrom = pullCondition(conds, ["230690007", "266257000", "13713005"]);
			var CHADscore = calcCHADScore(calculateAge(pt[0].birthDate), //age
			pt[0].gender, //gender
			chf, //chf
			hypertension, //hypertension
			vascDisease, //vascDisease
			diabetes, //diabetes
			strTIAthrom); //strTIAthrom
			parentComponent.setState({
				score: CHADscore,
				sym: "%"
			});
		});
	}

	render() {
		var opacity = this.state.score/100;
		var link = window.location.origin + '/risk/Stroke';
		return (
			<g>
				<a xlinkHref={link} target="_blank">
		    		<rect width="95%" height="95%" x="2.5%" y="2.5%" rx="20" ry="20" style={{fill:'red',stroke:'#888D95',strokeWidth:3,fillOpacity: opacity}}/>
				</a>
				<text x="50%" y="60%" fontSize="28" alignmentBaseline="middle" textAnchor="middle">{this.state.score}{this.state.sym}</text>
			</g>
		);
	}
}

export class ReynoldsScore extends Component {
	constructor(props) {
		super();
		this.state = {
			score: "..."
		};
	}

	componentDidMount() {
		var parentComponent = this;
		$.when(this.props.pt, this.props.obs).done(function(pt, obs) {
			var codesObject = {
				'30522-7': [], //hsCRP
				"2093-3": [], //cholesterol
				"2085-9": [], //HDL
				"8480-6": [] //sysBP
			};
			var sortedObs = searchByCode(obs, codesObject);
			for (var key in sortedObs) {
				if(sortedObs.hasOwnProperty(key)) {
					if(sortedObs[key].length == 0) {
						alert("Patient does not have adequate measurements for Reynolds Risk Score.");
						return;
					}
				}
			}
			var reynolds = (calculateReynolds(calculateAge(pt[0].birthDate),
			sortedObs['8480-6'][0].value,
			sortedObs['30522-7'][0].value,
			sortedObs['2093-3'][0].value,
			sortedObs['2085-9'][0].value,
			false, //smoker
			false, //famHist
			pt[0].gender));
			parentComponent.setState({
				score: reynolds,
				sym: "%"
			});
		});
	}

	render() {
		var opacity = this.state.score/100;
		var link = window.location.origin + '/risk/General_Cardiac';
		return (
			<g>
				<a xlinkHref={link} target="_blank">
		    		<rect width="95%" height="95%" x="2.5%" y="2.5%" rx="20" ry="20" style={{fill:'red',stroke:'#888D95',strokeWidth:3,fillOpacity: opacity}}/>
				</a>
				<text x="50%" y="60%" fontSize="28" alignmentBaseline="middle" textAnchor="middle">{this.state.score}{this.state.sym}</text>
			</g>
		);
	}
}

export class RiskTile extends Component {
	constructor(props) {
		super();
	}

	render() {
		return (
			<svg width="100%" height="100%" viewBox="0 0 123 118" version="1.1">
				<g>
				    {this.props.children}
				    <text x="50%" y="20%" fontSize="vw" alignmentBaseline="middle" textAnchor="middle">{this.props.scoreName}</text>  

			    </g>
			</svg>
		);
	}
}

export class HelpRiskTile extends Component {
	constructor(props) {
		super();
		this.state = {
			score: "...",
		};
	}

	render() {
		return (
			<div>
				<svg onClick={() => this.refs.simpleDialog.show()} width="100%" height="100%" viewBox="0 0 123 118" version="1.1">
					<g>
					    <rect width="95%" height="95%" x="2.5%" y="2.5%" rx="20" ry="20" style={{fill:'red',stroke:'#888D95',strokeWidth:3,fillOpacity:0}}/>
					    <text x="50%" y="20%" fontSize="2vw" alignmentBaseline="middle" textAnchor="middle">{this.props.scoreName}</text>
					    <text x="50%" y="60%" fontSize="3vw" alignmentBaseline="middle" textAnchor="middle">?</text>  
				    </g>
				</svg>
				<SkyLight hideOnOverlayClicked ref="simpleDialog" title="What is risk? How do I interpret it?">
          			In this context, risk refers to how likely you are to develop a disease or suffer from an acute illness. Each score has slightly different meanings. {<br/>}
          			The Cardiac Risk Score represents the likelihood of you suffering from a major cardiac event, such as a heart attack, within the next 10 years. {<br/>}
          			The Stroke Score represents the likelihood of you suffering from a stroke within the next year. {<br/>}
          			The Kidney Failure score represents the likelihood of you developing kidney failure within the next five years. {<br/>}
          			The Chronic Obstructive Pulmonary Disease (COPD) Score represents the likelihood of you dying due to chronic obstructive pulmonary dieases within the next four years. {<br/>}
          			The Diabetes Score repsents the likelihood you will develop type II diabetes within 5 years. 
        		</SkyLight>
			</div>
		);
	}
}