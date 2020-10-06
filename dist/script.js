var searchEle = document.querySelector(".input"),
	result = document.querySelector(".results"),
	visual = document.querySelector(".visual"),
	info = document.querySelector(".info");


	function doSearch(dataset, fuse) {

		showMore = 9;
		showMoreindices=[0, showMore];


		resultJSON = {}
		visual.innerHTML=""
		resultJSON = searchEle.value ? fuse.search(searchEle.value): dataset.map(item => {
			return { item: item }
		});
		if (resultJSON.length>showMore){
			document.getElementById('ShowMoreButton').style.visibility = 'visible';
		}
		else{
			document.getElementById('ShowMoreButton').style.visibility = 'hidden';
		}
		renderVisual(resultJSON, showMoreindices, showMore);
		info.innerHTML = `Found <strong>${resultJSON.length} equations </strong>`;
		visual.scrollTo(0, 0);
		result.scrollTo(0, 0);
	}


function renderVisual(resultJSON, indices, increment) {
	currentidxs = indices

	json_snip = resultJSON.slice(currentidxs[0],currentidxs[1])
	let html;

	html = json_snip.reduce((sum, curr) => {
		const {name,latex,href,contributed_by,description} = curr;
		return sum + `
		<div class="item" onclick="showModalDetails(${curr.item.id})">
			<div class="header columns">
			<div class="column is-two-thirds">
				<h2 class="title has-text-centered-mobile">${curr.item.name} <div class='divider'></div> <i class="rotate fa fa-angle-right" aria-hidden="true"></i></h2>

<span id="msg-${curr.item.id}"></span>
</div>
<div class="column">
<div class="level-right has-text-centered">
      <button class="button_hover" onclick="copyToClipboardMsg(${curr.item.id})">

<span>
    <i class="fa fa-copy" aria-hidden="true"></i>
  </span>
              <span>TeX</span>
</button>
<div class='divider'></div>
</button>

<button class="button_hover" onclick="downloadPNG(${curr.item.id})">
  <span>
    <i class="fa fa-download" aria-hidden="true"></i>
  </span>
              <span>png</span>
</button>
</div>
</div>
			</div>
      <div id = 'formula-${curr.item.id}' ><span class="formula">
 ${curr.item.latex}
</span>
</div>
			<div class="content description columns" id="content-${curr.item.id}"></div>

		</div>
		`
	}, '');

	no_results_html = `<div class="item" align="center">
		Oops! We don't have what you're looking for. You can add the formula for the next engineers who will search for it:<br><br>
		<button class="button is-info" onclick="location.href='https://github.com/valispace/WhatsThatFormula';"> <span class="icon"><i class="fa fa-plus"></i></span> <divider>Add a formula</button>
		</div>`

		if (resultJSON.length>0){
			visual.innerHTML += html;
		}
		else{
			visual.innerHTML=no_results_html;
		}

	MathJax.typeset()
	if (currentidxs[0]!=0){
		firstElem = document.getElementById("formula-"+currentidxs[0])
		firstElem.scrollIntoView()
	}

	showMoreindices = currentidxs.map(function (num, idx) {
		var next = num +increment;
		if (next[1]>resultJSON.length){
			next[1] = resultJSON.length;
		}
		return next;
		});
	if (showMoreindices[0]>resultJSON.length){
		document.getElementById('ShowMoreButton').style.visibility = 'hidden';
	}
}

function showDetails(id) {
	var element = document.getElementById('content-' + id);
	var parent = element.parentElement;
	if(element.innerHTML.trim()) {
		element.innerHTML = "";
		parent.classList.remove('show-card');
	} else {
		var item = dataset.find(x => x.id===id);
		var defineHTML = getdefinitionHTML(item.definition);
		var html = '';
		if(item.definition && item.definition.length !== 0) {
		html = `
		<div class="description-text column is-half-desktop">
			<h5 class="has-text-centered-mobile"> ${item.description}
			<h5 class="has-text-centered-mobile link is-medium"> Find more information<a href=${item.href} target="_blank">here</a></h5>
		</div>
      	<div class="column"><span> ${defineHTML} </span></div>
			</div>
			`;
		} else {
			html = `<div class="description-text column">
			<h5 class="has-text-centered-mobile"> ${item.description}
			<h5 class="link has-text-centered-mobile"> Find more information<a href=${item.href} target="_blank">here</a></h5>
			</div>
		</div>`
		}
		element.innerHTML += html;
		parent.classList.add('show-card');
		MathJax.typeset();
	}
}

function showModalDetails(id) {
	var modal = document.getElementById('modal-description');
	var modalContent = modal.querySelector('#modal-content');
	modalContent.innerHTML = '';
	var item = dataset.find(x => x.id===id);
	var defineHTML = getdefinitionHTML(item.definition);
	var html = `
	<div class="columns header is-mobile">
		<div class="column is-two-thirds is-three-quarters-mobile"><span style="font-weight: bold">${item.name}</span></div>
		<div class="column">
			<button class="delete close-button" aria-label="close" onclick="closeModal()"></button>
		</div>
	</div>
	<div class="formula">${item.latex}</div>
	<div class="buttons has-text-centered-mobile">
		<button class="button" onclick="downloadPNG(${item.id})">
			<span>Download PNG</span>
		</button>
		<button class="button" onclick="copyToClipboardMsg(${item.id})">
			<span>Copy TeX Code </span>
		</button>
	</div>`;
	if(item.definition && item.definition.length !== 0) {
		html +=
			`<div class="modal-content-description columns">
				<div class="description-text column is-half-desktop">
				<div class="description">
					<h5 class="description-title">Description:</h5>
					<h5 class="has-text-centered-mobile"> ${item.description}</h5>
					<h5 class="has-text-centered-mobile link is-medium"> Find more information <a style="color:orange" href=${item.href} target="_blank">here</a></h5>
				</div>`;
		if(item.tags?.length) {
			html += `<div class="categories"><h5 class="description-title">Categories:</h5>`;
			for(let i = 0; i < item.tags.length; i++) {
				html += `<h5 class="category has-text-centered-mobile"> ${item.tags[i]}</h5>`;
			}
			html+= '</div>'
		}
		html +=`
			</div>
				<div class="column">
				<h5 class="description-title">Variables:</h5>
				<span> ${defineHTML} </span>
				</div>
			</div>`;
		} else {
			html =
				`<div class="modal-content-description columns">
					<div class="description-text column">
						<h5 class="description-title">Description:</h5>
						<h5 class="has-text-centered-mobile"> ${item.description}
						<h5 class="link has-text-centered-mobile"> Find more information<a style="color:orange" href=${item.href} target="_blank">here</a></h5>
					</div>`;
			if(item.tags?.length) {
				html += `<div class="categories"><h5 class="description-title">Categories:</h5>`;
				for(let i = 0; i < item.tags.length; i++) {
					html += `<h5 class="category has-text-centered-mobile"> ${item.tags[i]}</h5>`;
				}
				html+= '</div>'
			}
			html+=`</div>`;
		}
	modalContent.innerHTML +=html;
	MathJax.typeset();
	modal.classList.add('is-active');
}

function closeModal() {
	document.getElementById('modal-description').classList.remove('is-active');
}

function getdefinitionHTML(defined){
  var begin_TeX = "$$ \\begin{align*}";
  var tex = "";
  var end_TeX = "\\end{align*} $$";
  var defvars = Object.keys(defined);
  if (defvars.length>0){
	defvars.forEach(function(entry){
		tex += entry+": & \\quad \\text{"+ defined[entry]+"} \\\\";
	});
	return begin_TeX+tex+end_TeX;
	}
	else {
		return "";
	};

}
function onKeyup() {
	console.log(searchEle.value);
	if(!searchEle.value) {
		doSearch(dataset, fuse);
	}
}

function downloadPNG(id) {
	var item = dataset.find(x => x.id === id);
	var formulaEL = document.getElementById('formula-'+id);
	var svg = formulaEL.querySelector('svg');
	svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

	var svgClone = svg.cloneNode(true);
	svgClone.setAttribute("width", svg.width.baseVal.value + 100 + 'px');
	svgClone.setAttribute("height", svg.height.baseVal.value + 50 + 'px');

	var image = new Image();
	image.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgClone.outerHTML)));
	image.onload = function () {
		var canvas = document.createElement('canvas');
		canvas.width = svgClone.width.baseVal.value;
		canvas.height = svgClone.height.baseVal.value;
		var context = canvas.getContext('2d');
		context.drawImage(image, 0, 0);
		var img = canvas.toDataURL('image/png');
		var link = document.createElement('a');
		link.download = item.name.trim().toLowerCase() + '.png';
		link.style.opacity = "0";
		document.body.append(link);
		link.href = img;
		link.click();
		link.remove();
	};
}

function copyToClipboardMsg(id) {
    var item = dataset.find(x => x.id === id);
    var el = document.createElement('textarea');
    var raw = item.latex;
    raw = raw.replace('$$',"$");
    var processed = raw.replace('$$',"$");
    el.value = processed;
    el.style = {
        display: 'none'
    };
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999);
    /* Copy the text inside the text field */
    document.execCommand("copy");
    document.body.removeChild(el);
    var msg = "TeX code copied to the clipboard.";
    var msgElem = document.getElementById('msg-' + id);
	msgElem.innerHTML = msg;
	msgElem.style.marginRight = '10px';
    setTimeout(function () {
        msgElem.innerHTML = "";
    }, 2000);
}

function openNavMenu() {
	const navMenu = document.getElementById('navMenu');
	//navMenu.classList.toggle('is-active');
	navMenu.classList.toggle('is-active');
}

var raw_dataset = [
    {
        "name": "Classical central force problem",
        "latex": "$$t-t_{0} = \\int_{r_{0}}^{r}\\frac{dr}{\\pm \\sqrt{\\frac{2}{m}(E-U(r))-\\frac{h^{2}}{r^{2}}}}$$",
		"description": "In classical potential theory, the central-force problem is to determine the motion of a particle in a single central potential field.",
		"definition": {},
        "keywords": ["central force", "central potential field", "orbit"],
        "tags": ["Orbital mechanics", "Classical mechanics"],
        "href":"https://en.wikipedia.org/wiki/Classical_central-force_problem",
        "contributed_by": "---"
	},
	{
		"name": "Kepler's 2nd law",
		"latex": "$$\\frac{dA}{dt}=\\frac{H_{0}}{2m}=\\frac{h}{2}=constant$$",
		"description": "In astronomy, Kepler's laws of planet motion are three scientific laws describing the motion of planets around the Sun. Second law: a line joining a planet and the Sun sweeps out equal areas during equal intervals of time.",
		"definition": {
				"dA" : "Area swept",
				"H_0" : "Total Angular momentum",
				"h" : "Specific Angular Momentum",
				"m" : "mass of the body"
			},
		"keywords": ["planetary motion", "Kepler’s laws", "sun", "central force", "orbit"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion",
		"contributed_by": "Johannes Kepler"
	},
	{
		"name": "Conservation of angular momentum",
		"latex": "$$\\overrightarrow{H_{0}}=\\overrightarrow{r}\\times m\\overrightarrow{v}=constant$$",
		"description": "angular momentum can be exchanged between objects in a closed system, but total angular momentum before and after an exchange remains constant (is conserved).",
		"definition":{
			"\\overrightarrow{H_{0}}": "Total angular momentum vector",
			"\\overrightarrow{r}" : "Position vector",
			"\\overrightarrow{v}" : "Velocity vector",
			"m" : "Mass of the body"
		},
		"keywords": ["angular momentum", "closed system", "orbit", "central force"],
		"tags": ["Physics", "Orbital mechanics"],
		"href":"https://en.wikipedia.org/wiki/Angular_momentum",
		"contributed_by": ""
	},
	{
		"name": "Specific orbital angular momentum",
		"latex": "$$h=r^{2}\\dot{\\theta}$$",
		"description": "Specific angular momentum is a constant vector for a given orbit under ideal conditions.",
		"definition": {
			"h" : "Specific angular momentum",
			"r": "distance",
			"\\theta": "Angular position"
		},
		"keywords": ["angular momentum", "orbit", "central force"],
		"tags": ["Physics", "Orbital mechanics", "Celestial mechanics"],
		"href":"https://en.wikipedia.org/wiki/Specific_angular_momentum",
		"contributed_by": ""
	},
	{
		"name": "Gravitational central force",
		"latex": "$$F_g=\\frac{GMm}{r^{2}}$$",
		"description": "Every planetary body is surrounded by its own gravitational field, which can be conceptualized with Newtonian physics as exerting an attractive force on all objects.",
		"definition": {
			"F_g" : "Gravitational Force",
			"G": "Gravitational constant",
			"M": "Mass 1",
			"m": "Mass 2",
			"r": "Distance between the masses"
		},
		"keywords": ["central force", "gravity"],
		"tags": ["Physics", "Orbital mechanics", "Classical mechanics"],
		"href":"https://en.wikipedia.org/wiki/Gravity",
		"contributed_by": "Isaac Newton"
	},
	{
		"name": "Standard Gravitational Parameter",
		"latex": "$$ \\mu =GM $$",
		"description": "In celestial mechanics, the standard gravitational parameter μ of a celestial body.",
		"definition": {
			"\\mu": "Standard Gravitational Parameter",
			"G": "Gravitational constant",
			"M": "Mass of the body"
		},
		"keywords": ["gravity", "central force", "elliptical orbit"],
		"tags": ["Celestial mechanics", "Orbital mechanics", "Physics"],
		"href":"https://en.wikipedia.org/wiki/Standard_gravitational_parameter",
		"contributed_by": ""
	},
	{
	"name": "Specific Orbital Energy",
	"latex": "$$ \\varepsilon =-\\frac{\\mu }{2a} $$",
	"description": "In celestial mechanics, the standard gravitational parameter of a celestial body is the product of the gravitational constant and the mass of the body.",
	"definition": {
		"\\varepsilon" : "Specific Orbital Energy",
		"\\mu": "Standard Gravitational Parameter",
		"a" : "Semi-major axis of the Ellipse"
	},
	"keywords": ["energy", "elliptical orbit"],
	"tags": ["Physics", "Orbital mechanics"],
	"href":"https://en.wikipedia.org/wiki/Specific_orbital_energy",
	"contributed_by": ""
	},
	{
		"name": "Orbital eccentricity",
		"latex": "$$e= \\sqrt{1+2\\varepsilon (\\frac{h}{\\mu})^{2}} $$",
		"description": "A measure of the non-circularity of an orbit",
		"definition": {
			"e" : "Orbit eccentricity",
			"\\varepsilon" : "Specific Orbital Energy",
			"\\mu": "Standard Gravitational Parameter",
			"h" : "Specific angular momentum"
		},
		"keywords": ["eccentricity", "elliptical orbit"],
		"tags": ["Orbital mechanics"],
		"href":"https://en.wikipedia.org/wiki/Orbital_eccentricity",
		"contributed_by": ""
	},
	{
		"name": "Radial orbital velocity",
		"latex": "$$v_{r}=\\frac{\\mu}{h}e\\cdot \\sin \\theta$$",
		"description": "The radial velocity of an object with respect to a given point is the rate of change of the distance between the object and the point.",
		"definition": {
			"v_{r}" : "Radial velocity",
			"e" : "Orbit eccentricity",
			"\\theta" : "Angular Position (true anomaly)",
			"\\mu": "Standard Gravitational Parameter",
			"h" : "Specific angular momentum"
		},
		"keywords": ["elliptical orbit"],
		"tags": ["Orbital mechanics"],
		"href":"https://en.wikipedia.org/wiki/Radial_velocity",
		"contributed_by": ""
	},
	{
		"name": "Orbital Mean motion",
		"latex": "$$ n=\\frac{2\\pi}{T}=\\sqrt{\\frac{\\mu}{a^{3}}} $$",
		"description": "Mean motion is the angular speed required for a body to complete one orbit, assuming constant speed in a circular orbit which completes in the same time as the variable speed, elliptical orbit of the actual body.",
		"definition": {
			"n" : "Mean Motion",
			"T" : "Orbit Time Period",
			"a" : "Semi-major axis of the orbit",
			"\\mu": "Standard Gravitational Parameter",
			"h" : "Specific angular momentum"
		},
		"keywords": ["elliptical orbit"],
		"tags": ["Orbital mechanics"],
		"href":"https://en.wikipedia.org/wiki/Mean_motion",
		"contributed_by": ""
	},
	{
		"name": "Escape velocity",
		"latex": "$$v_{esc}=\\sqrt{\\frac{2\\mu}{r}}$$",
		"description": "Escape velocity is the minimum speed needed for a free, non-propelled object to escape from the gravitational influence of a massive body, that is, to achieve an infinite distance from it.",
		"definition": {
			"v_{esc}" : "Escape Velocity",
			"r" : "Distance from gravitational center",
			"\\mu": "Standard Gravitational Parameter"
		},
		"keywords": ["elliptical orbit"],
		"tags": ["Orbital mechanics"],
		"href":"https://en.wikipedia.org/wiki/Escape_velocity",
		"contributed_by": ""
	},
	{
		"name": "Orbital period for the elliptical orbit",
		"latex": "$$ T=\\frac{2\\pi}{\\sqrt{\\mu}}a^{3/2} $$",
		"description": "The orbital period is the time a given astronomical object takes to complete one orbit around another object.",
		"definition": {
			"T" : "Orbit Time Period",
			"a" : "Semi-major axis of the orbit",
			"\\mu": "Standard Gravitational Parameter"
		},
		"keywords": ["elliptical orbit"],
		"tags": ["Orbital mechanics"],
		"href":"https://en.wikipedia.org/wiki/Orbital_period",
		"contributed_by": ""
	},
	{
		"name": "Kepler’s 3rd law",
		"latex": "$$ \\left(\\frac{T_{2}}{T_{1}}\\right)^{2}=\\left(\\frac{a_{2}}{a_{1}}\\right)^{3} $$",
		"description": "In astronomy, Kepler's laws of planet motion are three scientific laws describing the motion of planets around the Sun. Third law: the square of a planet's orbital period is proportional to the cube of the semi-major of its orbit.",
		"definition": {
			"T" : "Orbit Time Period",
			"a" : "Semi-major axis of the orbit"
		},
		"keywords": ["elliptical orbit"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion",
		"contributed_by": ""
	},
	{
		"name": "Eccentricity vector",
		"latex": "$$\\overrightarrow{e}=\\frac{1}{\\mu}(\\overrightarrow{v}\\times \\overrightarrow{h}-\\frac{\\mu \\overrightarrow{r}}{r})$$",
		"description": "The eccentricity vector of a Kepler orbit is the dimensionless vector with direction pointing from apoapsis to periapsis and with magnitude equal to the orbit's scalar eccentricity.",
		"definition": {
			"\\overrightarrow{e}" : "Eccentricity vector",
			"\\overrightarrow{h}": "Angular momentum vector",
			"\\overrightarrow{r}" : "Position vector",
			"\\overrightarrow{v}" : "Velocity vector",
			"\\mu": "Standard Gravitational Parameter"
		},
		"keywords": ["elliptical orbit", "Eccentricity"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Eccentricity_vector",
		"contributed_by": ""
	},
	{
		"name": "Vis-viva equation",
		"latex": "$$\\frac{v^{2}}{2}-\\frac{\\mu}{r}=\\varepsilon=c \\quad; \\quad v=\\sqrt{2\\mu(\\frac{1}{r}-\\frac{1}{2a})}$$",
		"definition": {
			"v" : "Total Velocity/speed",
			"r" : "Distance from gravitational center",
			"a" : "Semi-major axis of the orbit",
			"\\mu": "Standard Gravitational Parameter"
		},
		"description": "The vis-viva equation, also referred to as orbital-energy-invariance law, is one of the equations that model the motion of orbiting bodies.",
		"keywords": ["elliptical orbit","orbital-energy-invariance"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Vis-viva_equation",
		"contributed_by": ""
	},
	{
		"name": "Orbit equation: Kepler’s 1st law",
		"latex": "$$ r=\\frac{h^{2}}{\\mu}\\frac{1}{1+e\\cdot cos\\theta}=\\frac{p}{1+e\\cdot cos\\theta} $$",
		"description": "In astronomy, Kepler's laws of planet motion are three scientific laws describing the motion of planets around the Sun. First law: the orbit of every planet is an ellipse with the Sun at one of the two foci.",
		"definition": {
			"\\theta" : "Angular position/ True Anomaly",
			"e" : "Orbit Eccentricity",
			"\\mu": "Standard Gravitational Parameter",
			"h" : "Specific angular momentum",
			"r" : "Distance from gravitational center",
			"p": "Semi-latus rectum of the elliptical orbit"
		},
		"keywords": ["elliptical orbit", "Kepler", "Kepler's Law"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion",
		"contributed_by": ""
	},
	{
		"name": "Kepler’s Equation (Mean Anomaly)",
		"latex": "$$ M=n(t-t_{0})=E-e\\cdot \\sin E $$",
		"description": "Kepler's equation relates various geometric properties of the orbit of a body subject to a central force.",
		"definition":{
			"M": "Mean Anomaly",
			"t": "time",
			"n": "Mean motion",
			"E": "Eccentric Anomaly",
			"e": "Eccentricity of the orbit"
		},
		"keywords": ["elliptical orbit", "Mean anomaly"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Kepler%27s_equation",
		"contributed_by": ""
	},
	{
		"name": "Εccentric Anomaly",
		"latex": "$$ tanE=\\frac{\\sqrt{1-e^{2}}\\sin \\theta}{e+\\cos \\theta}\\quad;\\quad tan\\frac{E}{2}=\\sqrt{\\frac{1-e}{1+e}}tan\\frac{\\theta}{2} $$",
		"description": "Eccentric anomaly as function of true anomaly for an elliptical orbit.",
		"definition":{
			"\\theta" : "Angular position/ True Anomaly",
			"E": "Eccentric Anomaly",
			"e": "Eccentricity of the orbit"
		},
		"keywords": ["elliptical orbit", "eccentric anomaly"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"",
		"contributed_by": ""
	},
	{
		"name": "Orbit equation: Circular orbit",
		"latex": "$$ r=\\frac{h^{2}}{\\mu} $$",
		"description": "A circular orbit is the orbit with a fixed distance around the barycenter, that is, in the shape of a circle.",
		"definition": {
			"\\mu": "Standard Gravitational Parameter",
			"h" : "Specific angular momentum",
			"r" : "Distance from gravitational center"
		},
		"keywords": ["circular orbit", "orbit equation"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Circular_orbit",
		"contributed_by": ""
		},

	{
		"name": "Circular Orbit Velocity",
		"latex": "$$ v=\\sqrt{\\frac{\\mu}{r}} $$",
		"description": "The relative circular orbit velocity is constant for the circular orbit.",
		"definition": {
			"v" : "Total Velocity/speed",
			"r" : "Distance from gravitational center",
			"\\mu": "Standard gravitational parameter"
		},
		"keywords": ["circular orbit", "circular velocity"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Circular_orbit",
		"contributed_by": ""
	},

	{
		"name": "Time-true anomaly relation: Circular orbit",
		"latex": "$$ t=\\frac{\\theta}{2\\pi}T $$",
		"description": "Time versus true anomaly for the circular orbit",
		"definition": {
			"\\theta" : "Angular position/ True Anomaly",
			"t" : "time since periapsis",
			"T": "Orbit Time period"
		},
		"keywords": ["circular orbit","true anomaly", "time"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/True_anomaly",
		"contributed_by": ""
	},

	{
		"name": "Orbital period: Circular orbit",
		"latex": "$$ T=\\frac{2\\pi}{\\sqrt{\\mu }}r^{3/2} $$",
		"description": "The orbital period is the time a given astronomical object takes to complete one orbit around another object.",
		"definition": {
			"T": "Orbit time period",
			"r" : "Distance from gravitational center",
			"\\mu": "Standard gravitational parameter"
		},
		"keywords": ["circular orbit", "Orbit period"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Orbital_period",
		"contributed_by": ""
	},
	{
		"name": "Mean anomaly: Parabolic Orbit",
		"latex": "$$ M_{p}=\\frac{\\mu^{2}}{h^{3}}t $$",
		"description": "The mean anomaly is the fraction of an elliptical orbit's period that has elapsed since the orbiting body passed periapsis, expressed as an angle which can be used in calculating the position of that body in the classical two-body problem.",
		"definition":{
			"M": "Mean Anomaly",
			"t": "time",
			"\\mu": "Standard gravitational parameter",
			"h" : "Specific angular momentum"
		},
		"keywords": ["parabolic orbit"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href": "https://en.wikipedia.org/wiki/Mean_anomaly",
		"contributed_by": ""
	},

	{
		"name": "Barker’s equation",
		"latex": "$$ 2\\sqrt{\\frac{\\mu}{p^{3}}}(t-t_{0})=tan\\frac{\\theta}{2}+\\frac{1}{3}tan^{3}\\frac{\\theta}{2} $$",
		"description": "Barker's equation relates the time of flight to the true anomaly of a parabolic trajectory.",
		"definition": {
			"\\mu": "Standard gravitational parameter",
			"\\theta" : "Angular position/ True Anomaly",
			"t - t_0" : "time since periapsis",
			"T": "Orbit Time period",
			"p": "Semi-latus rectum of the elliptical orbit"
		},
		"keywords": ["parabolic orbit"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Parabolic_trajectory",
		"contributed_by": ""
	},
	{
		"name": "Mean anomaly: Hyperbolic Orbit",
		"latex": "$$ M_{h}=\\frac{\\mu^{2}}{h^{3}}(e^{2}-1)^{3/2}t $$",
		"description": "The mean anomaly is the fraction of an elliptical orbit's period that has elapsed since the orbiting body passed periapsis, expressed as an angle which can be used in calculating the position of that body in the classical two-body problem.",
		"definition": {
			"\\mu": "Standard gravitational parameter",
			"M_{h}" : "Hyperbolic mean anomaly",
			"t" : "time since periapsis",
			"e": "Orbit Eccentricity",
			"h" : "Specific angular momentum"
		},
		"keywords": ["hyperbolic orbit"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Hyperbolic_trajectory",
		"contributed_by": ""
	},

	{
		"name": "Kepler’s equation: Hyperbolic Orbit",
		"latex": "$$ \\sqrt{\\frac{\\mu}{-a^{3}}}(t-t_{0})=e\\cdot \\sinh F-F $$",
		"description": "Kepler's equation relates various geometric properties of the orbit of a body subject to a central force.",
		"definition": {
			"\\mu": "Standard gravitational parameter",
			"F" : "Hyperbolic anomaly",
			"t" : "time since periapsis",
			"e": "Orbit Eccentricity",
			"a" : "Semi-major axis of the orbit"
		},
		"keywords": ["hyperbolic orbit"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Kepler%27s_equation",
		"contributed_by": ""
	},
	{
		"name": "True anomaly: Hyperbolic Orbit",
		"latex": "$$ \\cos \\theta=\\frac{e-\\cosh F}{e\\cdot \\cos F-1} $$",
		"description": "True anomaly is an angular parameter that defines the position of a body moving along a Keplerian orbit. It is the angle between the direction of periapsis and the current position of the body, as seen from the main focus of the ellipse (the point around which the object orbits).",
		"definition": {
			"F" : "Hyperbolic anomaly",
			"\\theta" : "Angular position/ True Anomaly",
			"e": "Orbit Eccentricity"
		},
		"keywords": ["hyperbolic orbit"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/True_anomaly",
		"contributed_by": ""
	},
	{
		"name": "Earth’s nodal precession",
		"latex": "$$ \\dot{\\Omega}=-\\frac{3nJ_{2}R_{Earth}^{2}}{2a^{2}(1-e^{2})^2}\\cos i $$",
		"description": "Nodal precession is the precession of the orbital plane of a satellite around the rotational axis of an astronomical body such as Earth. This precession is due to the non-spherical nature of a rotating body, which creates a non-uniform gravitational field.",
		"definition": {
			"F" : "Hyperbolic anomaly",
			"\\theta" : "Angular position/ True Anomaly",
			"e": "Orbit Eccentricity"
		},
		"keywords": ["Earth"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Nodal_precession",
		"contributed_by": ""
	},
	{
		"name": "Effects of the Earth’s oblateness",
		"latex": "$$ \\dot{w}=\\frac{3nJ_{2}R_{Earth}^{2}}{2a^{2}(1-e^{2})^{2}}(2-\\frac{5}{2}\\sin^{2}i) $$",
		"description": "The earth's oblateness effects on the period of the latitudinal motion of a satellite in a near-circular orbit.",
		"definition": {
			"F" : "Hyperbolic anomaly",
			"\\theta" : "Angular position/ True Anomaly",
			"e": "Orbit Eccentricity"
		},
		"keywords": ["Earth"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"???",
		"contributed_by": ""
	},
	{
		"name": "Jacobi integral",
		"latex": "$$ \\frac{1}{2}v^{2}-\\frac{1}{2}(x^{2}+y^{2})+\\frac{1-\\mu}{r_{1}}-\\frac{\\mu}{r_{2}}=C $$",
		"description": "In celestial mechanics, Jacobi's integral (also known as the Jacobi integral or Jacobi constant) is the only known conserved quantity for the circular restricted three-body problem.",
		"definition": {
			"F" : "Hyperbolic anomaly",
			"\\theta" : "Angular position/ True Anomaly",
			"e": "Orbit Eccentricity"
		},
		"keywords": ["Earth"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Jacobi_integral",
		"contributed_by": "Carl Gustav Jacob Jacobi"
	},
	{
		"name": "Hohmann transfer: Delta-v",
		"latex": "\\begin{align} \\Delta v&=\\Delta v_{1}+\\Delta v_{2} \\\\ \\Delta v_{1}&=\\sqrt{2\\mu (\\frac{1}{r_{1}}-\\frac{1}{2(r_{1}+r_{2})})}-\\sqrt{\\frac{\\mu}{r_{1}}}; \\\\ \\Delta v_{2}&=\\sqrt{\\frac{\\mu}{r_{2}}} - \\sqrt{2\\mu (\\frac{1}{r_{2}}-\\frac{1}{2(r_{1}+r_{2})})} \\end{align}",
		"description": "Hohmann Transfer is an orbital maneuver that transfers a satellite or spacecraft from one circular orbit to another through a transfer orbit.",
		"definition": {
			"\\Delta v" : "Total Delta-V",
			"\\Delta v_1": "Delta-V for first burn",
			"\\Delta v_2": "Delta-V for second burn",
			"\\mu": "Standard gravitational parameter",
			"r_1": "Radius of initial orbit",
			"r_2": "Radius of final orbit"
		},
		"keywords": ["Hohmann maneuver"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Hohmann_transfer_orbit",
		"contributed_by": ""
	},
	{
		"name": "Hohmann transfer: Time",
		"latex": "$$t_{H}=\\pi\\sqrt{\\frac{(r_{1}+r_{2})^{3}}{8\\mu}}$$",
		"description": "Hohmann Transfer is an orbital maneuver that transfers a satellite or spacecraft from one circular orbit to another through a transfer orbit.",
		"definition": {
			"\\mu": "Standard gravitational parameter",
			"r_1": "Radius of initial orbit",
			"r_2": "Radius of final orbit",
			"t_{H}": "Transfer time"
		},
		"keywords": ["Hohmann maneuver"],
		"tags": ["Orbital mechanics", "Astronomy"],
		"href":"https://en.wikipedia.org/wiki/Hohmann_transfer_orbit",
		"contributed_by": ""
	},
	{
		"name": "Rocket Equation",
		"latex": "$$\\Delta v = I_{sp} \\, g_0 \\, \\ln \\left( \\frac{m_0}{m_f} \\right)$$",
		"description": "The Tsiolkovsky rocket equation, classical rocket equation, or ideal rocket equation is a mathematical equation that describes the motion of vehicles that follow the basic principle of a rocket: a device that can apply acceleration to itself using thrust by expelling part of its mass with high velocity can thereby move due to the conservation of momentum.",
		"definition":{
		"\\Delta V" : "change in velocity",
		"I_{sp} " : "specific impulse",
		"m_0" : "initial mass",
		"m_f" : "final mass"
		},
		"keywords": ["rocket", "delta-v", "tsiolkovski", "momentum", "propulsion"],
		"tags": ["Aerospace", "default"],
		"href": "https://en.wikipedia.org/wiki/Tsiolkovsky_rocket_equation",
		"contributed_by": "Hannibal Lecter"
	},
	{
		"name": "Wet mass Rocket",
		"latex": "$$m_{o}=m_{E}+m_{p}+m_{P L}$$",
		"description": "initial total mass, including propellant ie. the wet mass is the structural or empty mass of the rocket, the propellant mass and the payload mass",
		"definition": {
			"m_{o}": "wet or initial mass",
			"m_{E}": "Empty or structural mass",
			"m_{p}": "propellant mass",
			"m_{P L}": "Payload mass"
		},
		"keywords": ["Payload", "mass", "propellant", "wet", "rocket"],
		"tags": ["rocket", "mass"],
		"href":"https://en.wikipedia.org/wiki/Tsiolkovsky_rocket_equation",
		"contributed_by": "Dr Seuss"
	},
	{
		"name": "Dry mass Rocket",
		"latex": "$$m_{f}=m_{E}+m_{P L}$$",
		"description": "Final total mass without propellant ie. the dry mass so the structural or empty mass of the rocket and the payload mass",
		"definition":{
			"m_{f}": "dry or final mass",
			"m_{E}": "Empty or structural mass",
			"m_{P L}": "Payload mass"
		},
		"keywords": ["Payload", "mass", "dry", "rocket"],
		"tags": ["rocket", "mass"],
		"href":"https://en.wikipedia.org/wiki/Tsiolkovsky_rocket_equation",
		"contributed_by": "JK Rowling"
	},
	{
		"name": "Dynamic pressure",
		"latex": "$$q= \\frac{1}{2} \\rho v^{2}$$",
		"description": "point when an aerospace vehicle's atmospheric flight reaches maximum dynamic pressure.",
		"definition":{
			"rho": "local air density",
			"v": "velocity"
		},
		"keywords": ["pressure", "max-q", "aerodynamics", "rocket"],
		"tags": ["rocket", "pressure"],
		"href":"https://en.wikipedia.org/wiki/Max_q",
		"contributed_by": "Kazuo Ishiguro"
	},
	{
		"name": "Specific Impulse",
		"latex": "$$I_{s p}=\\frac{T}{\\dot{m}_{e} g_{o}}$$",
		"description": " total impulse (or change in momentum) delivered per unit of propellant consumed. It is a measure of how effectively a rocket uses propellant or a jet engine uses fuel",
		"definition":{
			"I_{s p}": "Specific Impulse",
			"T": "Thrust",
			"m_{e}": "Rate at which exhaust mass flows across the nozzle exit plane",
			"g_{o}": "Standard gravity (m/s^2)"
		},
		"keywords": ["impulse", "propellant","thrust", "effective use", "aerodynamics", "rocket"],
		"tags": ["rocket", "impulse", "propellant"],
		"href":"https://en.wikipedia.org/wiki/Specific_impulse",
		"contributed_by": "David Attenborough"
	},
	{
		"name": "Mass ratio",
		"latex": "$$n=\\frac{m_{o}}{m_{f}}$$",
		"description": "Ratio of the rocket's wet mass (vehicle plus contents plus propellant) to its dry mass(vehicle plus contents). Measure of the efficiency of a rocket ",
		"definition":{
			"n": "Mass ratio",
			"m_{o}": "wet or initial mass",
			"m_{f}": "dry or final mass"
		},
		"keywords": ["ratio", "mass","aerospace", "efficiency", "aerodynamics", "rocket"],
		"tags": ["rocket", "mass", "ratio"],
		"href":"https://en.wikipedia.org/wiki/Mass_ratio",
		"contributed_by": "Malcolm Gladwell"
	},
	{
		"name": "Structural Ratio",
		"latex": "$$\\varepsilon=\\frac{m_{E}}{m_{E}+m_{p}}=\\frac{m_{E}}{m_{o}-m_{P L}}$$",
		"description": "ratio between the empty mass of the stage (or structural mass), and the combined empty mass and propellant mass ",
		"definition": {
			"varepsilon": "Structural ratio",
			"m_{o}": "wet or initial mass",
			"m_{E}": "Empty or structural mass",
			"m_{p}": "propellant mass",
			"m_{P L}": "Payload mass"
		},
		"keywords": ["ratio", "mass","aerospace", "stage", "aerodynamics", "rocket"],
		"tags": ["rocket", "stage", "ratio"],
		"href":"https://en.wikipedia.org/wiki/Multistage_rocket",
		"contributed_by": "Rutger Bergman"
	},
	{
		"name": "Burnout speed",
		"latex": "$$v_{b o}=I_{s p} g_{o} \\ln n=I_{s p} g_{o} \\ln\\frac{1+\\lambda}{\\varepsilon+\\lambda}$$",
		"description": " Tsiolkovsky rocket equation, classical rocket equation, or ideal rocket equation. Describes the motion of a rocket that applies acceleration to itself using thrust by expelling part of its mass with high velocity and can thereby move due to the conservation of momentum.",
		"definition":
		{
			"v_{b o}": "Burnout Speed",
			"I_{s p}": "Specific Impulse",
			"g_{o}": "Standard gravity (m/s^2)",
			"n": "Mass ratio",
			"lambda": "Payload ratio",
			"varepsilon": "Structural ratio"
		},
		"keywords": ["ratio", "momentum","aerospace", "Tsiolkovsky", "classical", "ideal", "rocket"],
		"tags": ["rocket", "delta-v"],
		"href":"https://en.wikipedia.org/wiki/Tsiolkovsky_rocket_equation",
		"contributed_by": "Hans Rosling"
	},
	{
		"name": "Optimisation procedure to an N-Stage vehicle",
		"latex": "$$h=\\sum_{i=1}^{N}\\left[\\ln \\left(1-\\varepsilon_{i}\\right)+\\ln n_{i}-\\ln\\left(1-\\varepsilon_{i} n_{i}\\right)\\right]-\\eta\\left(v_{b o}-\\sum_{i=1}^{N} c_{i} \\ln n_{i}\\right)$$",
		"description": "Procedure for optimization of an N-stage vehicle, largest amount of payload is carried to the required burnout velocity using the least amount of non-payload mass",
		"definition":{
			"v_{b o}": "Burnout Speed",
			"n": "Mass ratio",
			"lambda": "Payload ratio",
			"varepsilon": "Structural ratio",
			"eta": " Lagrange Multiplier",
			"c_{a}": "Exhaust speed relative to the rocket"
		},
		"keywords": [ "momentum","aerospace", "Tsiolkovsky", "classical", "ideal", "rocket"],
		"tags": ["rocket", "delta-v"],
		"href":"https://rocketsim.wordpress.com/2017/05/07/performance-and-optimization-multi-stage-rockets/",
		"contributed_by": "Marjane Satrapi"
	},
	{
		"name": "Effective exhaust velocity",
		"latex": "$$c=c_{a}+\\frac{\\left(p_{e}-p_{a}\\right) A_{e}}{\\dot{m}_{e}}$$",
		"description": "average or mass equivalent velocity at which propellant is being ejected from the rocket vehicle",
		"definition":{
			"m_{E}": "Empty or structural mass",
			"A_{e}": "Nozzle exit area",
			"c_{a}": "Exhaust speed relative to the rocket",
			"c": "Exhaust exhaust velocity",
			"p_{a}": "Static pressure of the atmosphere",
			"p_{e}": "Rocket nozzle pressure"
		},
		"keywords": ["aerospace", "Tsiolkovsky", "exhaust", "velocity", "rocket"],
		"tags": ["rocket", "velocity"],
		"href":"https://en.wikipedia.org/wiki/Specific_impulse#Specific_impulse_as_effective_exhaust_velocity",
		"contributed_by": "Oliver Sacks"
	},
	{
		"name": "Burn time",
		"latex": "$$\\Delta t=\\frac{n-1}{n} \\frac{I_{s p}}{T / m_{o} g_{o}}$$",
		"description": "Duration in which rocket engine is activated",
		"definition":{
			"Delta t": "Burn time",
			"n": "Mass ratio",
			"I_{s p}": "Specific Impulse",
			"T": "Thrust",
			"m_{o}": "wet or initial mass",
			"g_{o}": "Standard gravity (m/s^2)"
		},
		"keywords": ["aerospace", "Tsiolkovsky", "propellant", "time", "rocket", "burn"],
		"tags": ["rocket", "time"],
		"href":"https://www.grc.nasa.gov/www/k-12/VirtualAero/BottleRocket/airplane/rktengperf.html",
		"contributed_by": "Paul Kalanithi"
	},
	{
		"name": "Thrust",
		"latex": "$$T=\\dot{m}_{e} c$$",
		"description": "Force generated by the propulsion system that moves the rocket through air or space",
		"definition":{
			"T": "Thrust",
			"m_{e}": "Rate at which exhaust mass flows across the nozzle exit plane",
			"c": "Exhaust exhaust velocity"
		},
		"keywords": ["aerospace", "Tsiolkovsky", "thrust", "delta-v", "rocket"],
		"tags": ["rocket", "thrust"],
		"href":"https://en.wikipedia.org/wiki/Delta-v",
		"contributed_by": "Roald Dahl"
	},
	{
		"name": "Payload ratio",
		"latex": "$$\\lambda=\\frac{m_{P L}}{m_{E}+m_{p}}=\\frac{m_{P L}}{m_{o}-m_{P L}}$$",
		"description": "",
		"definition":{
			"\\lambda": "Payload ratio",
			"m_{o}": "wet or initial mass",
			"m_{E}": "Empty or structural mass",
			"m_{p}": "propellant mass",
			"m_{P L}": "Payload mass"
		},
		"keywords": ["aerospace", "Tsiolkovsky", "mass", "ratio", "propellant"],
		"tags": ["rocket", "mass"],
		"href":"https://en.wikipedia.org/wiki/Payload_fraction",
		"contributed_by": "Bernardine Evaristo"
	},
	{
		"name": "Drag loss",
		"latex": "$$\\Delta v_{D}=\\int_{t_{o}}^{t_{f}} \\frac{D}{m} d t$$",
		"description": "Velocity lost due to drag",
		"definition":{
			"\\Delta v_{D}": "Drag loss",
			"D": "Drag",
			"m_{o}": "wet or initial mass",
			"m_{f}": "dry or final mass"
		},
		"keywords": ["aerospace", "Tsiolkovsky", "delta-v", "drag"],
		"tags": ["rocket", "delta-v"],
		"href":"",
		"contributed_by": "Harper Lee"
	},
	{
		"name": "Gravity Loss",
		"latex": "$$\\Delta v_{G}=\\int_{t_{o}}^{t_{f}} g \\sin \\gamma d t$$",
		"description": "Velocity lost due to gravity",
		"definition":{
			"\\Delta v_{G}": "Gravity loss",
			"g_{o}": "Standard gravity (m/s^2)",
			"gamma": "Flight path angle"
		},
		"keywords": ["aerospace", "Tsiolkovsky", "delta-v", "gravity"],
		"tags": ["rocket", "delta-v"],
		"href":"https://en.wikipedia.org/wiki/Gravity_drag",
		"contributed_by": "Yuval Noah Harari"
	},
	{
		"name": "Momentum equation for steady-state one dimension flow",
		"latex": "$$\\mathbf{F}=\\dot{m}\\left(\\mathbf{V}_{2}-\\mathbf{V}_{1}\\right)$$",
		"description": "",
		"definition": {},
		"keywords": ["flow", "nozzle", "momentum", "state"],
		"tags": ["momentum", "nozzle"],
		"href":"https://en.wikipedia.org/wiki/Compressible_flow",
		"contributed_by": "Obelix"
	},
	{
		"name": "Speed of sound (Ideal gas relation)",
		"latex": "$$c=\\sqrt{\\gamma R T}$$",
		"description": "",
		"definition": {
			"\\gamma": " Specific heat ratio",
			"R" : "Ideal gas constant",
			"T" : "Temperature"
		},
		"keywords": ["flow", "nozzle", "momentum", "state"],
		"tags": ["momentum", "nozzle"],
		"href":"https://en.wikipedia.org/wiki/Compressible_flow",
		"contributed_by": "Idefix"
	},
	{
		"name": "Mach number",
		"latex": "$$M=\\mathrm{V} / c$$",
		"description": "Ratio of flow velocity past a boundary to the local speed of sound",
		"definition": {
			"M": "Mach number",
			"u": "local flow velocity",
			"c": "speed of sound in the medium"
		},
		"keywords": ["flow", "nozzle", "mach"],
		"tags": ["mach", "nozzle"],
		"href":"https://en.wikipedia.org/wiki/Mach_number",
		"contributed_by": "Idefix"
	},
	{
		"name": "Stagnation enthalpy",
		"latex": "$$h_{\\mathrm{o}}=h+\\mathrm{V}^{2} / 2$$",
		"description": "Flow Enthalpy at the stagnation point",
		"definition": {},
		"keywords": ["flow", "nozzle", "enthalpy", "diffuser", "nozzle"],
		"tags": ["enthalpy", "nozzle"],
		"href":"https://en.wikipedia.org/wiki/Stagnation_enthalpy",
		"contributed_by": "Lucky Luke"
	},
	{
		"name": "Isentropic flow function relating temperature and stagnation temperature (constant \\(\\gamma\\))",
		"latex": "$$\\frac{T_{\\mathrm{o}}}{T}=1+\\frac{\\gamma-1}{2} M^{2}$$",
		"description": "Isentropic nozzle flow describes the movement of a gas or fluid through a narrowing opening without an increase or decrease in entropy. The isentropic stagnation state is the state a flowing fluid would attain if it underwent a reversible adiabatic deceleration to zero velocity.",
		"definition": {
			"M" : "Mach number",
			"v" : "Velocity",
			"p" : "Pressure",
			"T" : "Temperature",
			"\\rho": "Density",
			"A" : "Area",
			"q" : "Dynamic Pressure",
			"\\gamma" : "Specific heat ratio",
			"R" : "Gas Constant",
			"a" : "Speed of sound"
	},
		"keywords": ["flow", "nozzle", "momentum", "state"],
		"tags": ["flow", "nozzle"],
		"href":"https://en.wikipedia.org/wiki/Isentropic_nozzle_flow",
		"contributed_by": "Lucky Luke"
	},
	{
		"name": "Mach number",
		"latex": "$$M = \\frac{v}{a}$$",
		"description": "Mach number (M or Ma) is a dimensionless quantity in fluid dynamics representing the ratio of flow velocity past a boundary to the local speed of sound",
		"definition": {
			"M" : "Mach number",
			"v" : "Velocity",
			"a" : "Speed of sound"
		},
		"keywords": ["flow", "pressure", "sound", "Mach"],
		"tags": ["flow", "nozzle"],
		"href":"https://en.wikipedia.org/wiki/Mach_number",
		"contributed_by": "Lucky Luke"
	},
	{
		"name": "Mach number: Subsonic compressible flow",
		"latex": "$$\\mathrm{M}=\\sqrt{\\frac{2}{\\gamma-1}\\left[\\left(\\frac{q_{c}}{p}+1\\right)^{\\frac{\\gamma-1}{\\gamma}}-1\\right]}$$",
		"description": "Mach number (M or Ma) is a dimensionless quantity in fluid dynamics representing the ratio of flow velocity past a boundary to the local speed of sound",
		"definition": {
			"M" : "Mach number",
			"q_{c}" : "Impact/dynamic Pressure",
			"p" : "Static Pressure",
			"\\gamma" : "Specific heat ratio"
		},
		"keywords": ["flow", "pressure", "sound", "Mach"],
		"tags": ["flow", "nozzle"],
		"href":"https://en.wikipedia.org/wiki/Mach_number",
		"contributed_by": "Lucky Luke"
	},
	{
		"name": "Mach number: Supersonic compressible flow",
		"latex": "$$\\frac{p_{t}}{p}=\\left[\\frac{\\gamma+1}{2} \\mathrm{M}^{2}\\right]^{\\frac{\\gamma}{\\gamma-1}} \\cdot\\left[\\frac{\\gamma+1}{1-\\gamma+2 \\gamma \\mathrm{M}^{2}}\\right]^{\\frac{1}{\\gamma-1}}$$",
		"description": "  Rayleigh supersonic pitot Equation : Mach number (M or Ma) is a dimensionless quantity in fluid dynamics representing the ratio of flow velocity past a boundary to the local speed of sound",
		"definition": {
			"M" : "Mach number",
			"p" : "Static Pressure",
			"p_t" : "Total Pressure",
			"\\gamma" : "Specific heat ratio"
		},
		"keywords": ["flow", "pressure", "sound", "Mach"],
		"tags": ["flow", "nozzle"],
		"href":"https://en.wikipedia.org/wiki/Mach_number",
		"contributed_by": "Lucky Luke"
	},
	{
		"name": "Orbital Elements (Coversion from position and velocity)",
		"latex": "$$ \\begin{aligned} &a=-\\frac{\\mu}{v_{0}^{2}-\\frac{\\mu}{r_{0}}} \\quad \\vec{e}=\\frac{1}{\\mu}\\left[\\vec{v}_{0} \\times\\left(\\vec{r}_{0} \\times \\vec{v}_{0}\\right)-\\mu \\frac{\\vec{r}_{0}}{r_{0}}\\right] \\quad \\cos \\theta_{0}=\\frac{\\vec{e} \\cdot \\vec{r}_{0}}{e r_{0}}\\\\ &\\vec{n}=\\frac{\\vec{e}_{Z} \\times \\vec{h}}{\\left|\\vec{e}_{Z} \\times \\vec{h}\\right|} \\quad \\vec{n}=\\cos \\Omega \\vec{e}_{X}+\\sin \\Omega \\vec{e}_{Y} \\quad \\cos i=\\frac{\\vec{e}_{Z} \\cdot \\vec{h}}{|\\vec{h}|}\\\\ &\\cos \\varpi=\\frac{\\vec{n} \\cdot \\vec{e}}{|\\vec{e}|} \\quad \\tan \\theta_{0}=\\frac{\\left(\\frac{r_{0} e_{0}^{2}}{\\mu}\\right) \\sin \\gamma_{0} \\cos \\gamma_{0}}{\\left(\\frac{r_{0} \\sigma_{0}^{2}}{\\mu}\\right) \\cos ^{2} \\gamma_{0}-1} \\quad e^{2}=\\left(\\frac{r_{0} v_{0}^{2}}{\\mu}-1\\right)^{2} \\cos ^{2} \\gamma_{0}+\\sin ^{2} \\gamma_{0}\\\\ \\end{aligned} $$",
		"description": "Orbital elements are the parameters required to uniquely identify a specific orbit. In celestial mechanics these elements are considered in two-body systems using a Kepler orbit. There are many different ways to mathematically describe the same orbit, but certain schemes, each consisting of a set of six parameters, are commonly used in astronomy and orbital mechanics.",
		"definition": {
			"\\mu" : "Standard Gravitational parameter",
			"a" : "Semi-major axis of the orbit",
			"e" : "Eccentricity",
			"\\theta" : "True anomaly",
			"\\vec{n}": "Vector of nodes",
			"\\omega" : "Argument of Periapsis",
			"\\Omega" : "Right Ascension of Ascending Node"
		},
		"keywords": ["orbit", "orbital elements", "osculating", "linear"],
		"tags": ["Orbital Mechanics", "Astrodynamics"],
		"href":"https://en.wikipedia.org/wiki/Orbital_elements",
		"contributed_by": "Lucky Luke"
	},
	{
		"name": "Properties of an (Orbit) Ellipse",
		"latex": "\\[\\begin{aligned}&2 a=r_{p}+r_{a} \\quad ; \\quad  b=a \\sqrt{1-e^{2}} \\quad ; \\quad \\frac{x^{2}}{a^{2}}+\\frac{y^{2}}{b^{2}}=1 \\quad ;\\\\&r_{P}=a(1-e)=\\frac{p}{1+e} \\quad ; \\quad \\bar{C} F=c=a e \\quad ; \\quad \\text { Area }=a b \\pi\\\\ &r_{a}=a(1+e) \\quad; \\quad e=\\sqrt{1-\\left(\\frac{b}{a}\\right)^{2}} \\quad ; \\quad p=a\\left(1-e^{2}\\right)=\\frac{h^{2}}{\\mu}\\end{aligned}\\]",
		"description": "Orbital elements are the parameters required to uniquely identify a specific orbit. In celestial mechanics these elements are considered in two-body systems using a Kepler orbit. There are many different ways to mathematically describe the same orbit, but certain schemes, each consisting of a set of six parameters, are commonly used in astronomy and orbital mechanics.",
		"definition": {
			"a" : "Semi-major axis ",
			"b" : "Semi-minor axis",
			"p": "Semi-latus rectum",
			"r_p": "Radius of periapsis",
			"r_a": "Radius of apoapsis",
			"F" : "Focus point",
			"C" : "Center point",
			"e" : "Eccentricity",
			"\\theta" : "True anomaly"

		},
		"keywords": ["flow", "pressure", "sound", "Mach"],
		"tags": ["flow", "nozzle"],
		"href":"https://en.wikipedia.org/wiki/Ellipse",
		"contributed_by": "Lucky Luke"
	},
	{
		"name": "Centroid of a Volume",
		"latex": "\\[\\begin{array}{l}x_{c}=\\frac{\\int x \\mathrm{d} V}{\\int \\mathrm{d} V} \\\\ y_{c}=\\frac{\\int y \\mathrm{d} V}{\\int \\mathrm{d} V} \\\\ z_{c}=\\frac{\\int z \\mathrm{d} V}{\\int \\mathrm{d} V}\\end{array}\\]",
		"description": "The centroid or geometric center is the arithmetic mean position of all the points in the volume.",
		"definition": {
			"V" : "Arbitrary Volume"
		},
		"keywords": ["Statics", "Centroid"],
		"tags": ["Mechanical", "Statics"],
		"href":"https://en.wikipedia.org/wiki/Centroid",
		"contributed_by": ""
	},
	{
		"name": "Centre of Mass",
		"latex": "$$x_{c}=\\frac{\\sum x_{i} \\rho_{i} V_{i}}{\\sum \\rho_{i} V_{i}}, \\quad y_{c}=\\frac{\\sum y_{i} \\rho_{i} V_{i}}{\\sum {\\rho_i} V_{i}}, \\quad z_{c}=\\frac{\\sum z_{i} \\rho_{i} V_{i}}{\\sum \\rho_{i} V_{i}}$$",
		"description": "The center of mass of a distribution of mass in space (sometimes referred to as the balance point) is the unique point where the weighted relative position of the distributed mass sums to zero",
		"definition": {
			"\\rho" : "Material Density",
			"V" : "Volume"
		},
		"keywords": ["Statics", "Centroid"],
		"tags": ["Mechanical", "Statics"],
		"href":"https://en.wikipedia.org/wiki/Centroid",
		"contributed_by": ""
	},
	{
		"name": "Properties of Logarithms",
		"latex": "\\[\\begin{array}{l} \\log _{b}(x y)=\\log _{b} x+\\log _{b} y \\\\ \\log _{b}(x / y)=\\log _{b} x-\\log _{b} y \\\\ \\log _{b} x^{p}=p \\log _{b} x \\\\ \\log _{b}(1 / x)=-\\log _{b} x \\\\ \\log _{b} b \\quad=1 \\\\ \\log _{b} 1 \\quad=0 \\quad \\end{array}\\]",
		"description": "Properties of Logarithms ",
		"definition": {},
		"keywords": ["Logarithms", "Mathematics", "Exponential"],
		"tags": ["Mathematics", "Algebra"],
		"href":"https://en.wikipedia.org/wiki/Logarithm",
		"contributed_by": ""
	},
	{
		"name": "Logarithm base change",
		"latex": "$$ \\log_b \\,x \\; = \\;\\log_a \\,x \\; \\log_b \\,a \\; $$",
		"description": "Properties of Logarithms: change of base",
		"definition": {},
		"keywords": ["Logarithms", "Mathematics", "Exponential"],
		"tags": ["Mathematics", "Algebra"],
		"href":"https://en.wikipedia.org/wiki/Logarithm",
		"contributed_by": ""
	},
	{
		"name": "Law of Sines",
		"latex": "$$ \\frac{a}{\\sin A} \\;= \\; \\frac{b}{\\sin B} \\;= \\; \\frac{c}{\\sin C} $$",
		"description": "Properties of Logarithms: change of base",
		"definition": {
			"a,b,c" : "Lengths",
			"A,B,C" : "Angles"
		},
		"keywords": ["Sine", "trigonometry", "angles", "sine law", "Triangle"],
		"tags": ["Mathematics", "trigonometry"],
		"href":"https://en.wikipedia.org/wiki/Law_of_sines",
		"contributed_by": ""
	},
	{
		"name": "Law of Cosines",
		"latex": "$$ a^2 \\, = \\, b^2 \\, + \\, c^2 \\, - \\, 2cb\\cos A $$",
		"description": "Trigonometric Laws for triangles",
		"definition": {
			"a,b,c" : "Lengths",
			"A,B,C" : "Angles"
		},
		"keywords": ["Sine", "trigonometry", "angles", "cosine law", "triangle"],
		"tags": ["Mathematics", "trigonometry"],
		"href":"https://en.wikipedia.org/wiki/Law_of_cosines",
		"contributed_by": ""
	},
	{
		"name": "Law of Tangents",
		"latex": "$$ \\frac{a+b}{a-b}=\\frac{\\tan \\frac{1}{2}(A+B)}{\\tan \\frac{1}{2}(A-B)} $$",
		"description": "Trigonometric Laws for triangles",
		"definition": {
			"a,b,c" : "Lengths",
			"A,B,C" : "Angles"
		},
		"keywords": ["Tan", "tangent law","trigonometry", "angles", "triangle"],
		"tags": ["Mathematics", "trigonometry"],
		"href":"https://en.wikipedia.org/wiki/Law_of_sines",
		"contributed_by": ""
	},
	{
		"name": "Distance between a point and a line",
		"latex": "$$ d=\\frac{A x_{1}+B y_{1}+C}{\\pm \\sqrt{A^{2}+B^{2}}} $$",
		"description": "",
		"definition": {
			"(x,y)" : "Arbitrary point",
			"Ax+By+C = 0" : "Arbitrary line"
		},
		"keywords": ["Line", "Distance", "Geometry", "point"],
		"tags": ["Mathematics", "Geometry"],
		"href":"https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line",
		"contributed_by": ""
	},
	{
		"name": "Polar to Cartesian coordinates (2D)",
		"latex": "$$ \\begin{align} x = r \\cos \\theta, &\\quad y = r\\sin \\theta \\\\ r^2 = x^2 +y^2, &\\quad \\tan \\theta = \\frac{y}{x} \\end{align} $$",
		"description": "",
		"definition": {
			"(x,y)" : "Arbitrary cartesian coordinate",
			"r" : "Radial distance",
			"\\theta": "Angular position"
		},
		"keywords": ["Angles", "Polar", "Geometry", "point"],
		"tags": ["Mathematics", "Geometry"],
		"href":"https://en.wikipedia.org/wiki/Polar_coordinate_system",
		"contributed_by": ""
	},
	{
		"name": "Polar Coordinates: Unit Vectors",
		"latex": "$$ \\begin{array}{l} \\hat{e}_{r}=\\cos \\theta \\hat{i}+\\sin \\theta \\hat{j} \\\\ \\hat{e}_{\\theta}=-\\sin \\theta \\hat{i}+\\cos \\theta \\hat{j} \\end{array} $$",
		"description": "The polar coordinate system is a two-dimensional coordinate system in which each point on a plane is determined by a distance from a reference point and an angle from a reference direction. The reference point (analogous to the origin of a Cartesian coordinate system) is called the pole, and the ray from the pole in the reference direction is the polar axis. The distance from the pole is called the radial coordinate, radial distance or simply radius, and the angle is called the angular coordinate, polar angle, or azimuth",
		"definition": {
			"(\\hat{i},\\hat{j})" : "Unit vectors in cartesian coordinates",
			"(\\hat{e}_{r},\\hat{e}_{\\theta})" : "Unit vectors in polar coordinates",
			"\\theta": "Angular coordinate"
		},
		"keywords": ["Angles", "Polar", "Geometry", "point"],
		"tags": ["Mathematics", "Geometry"],
		"href":"https://en.wikipedia.org/wiki/Polar_coordinate_system",
		"contributed_by": "Grégoire de Saint-Vincent"
	},
	{
		"name": "Kinematic Equations: Polar Coordinates",
		"latex": "$$ \\begin{array}{l} \\vec{r}=r \\hat{e}_r \\quad \\vec{v}=\\dot{r} \\hat{e}_{r}+r \\dot{\\theta} \\hat{e}_{\\theta} \\\\ \\vec{a}=\\left(\\ddot{r}-r \\dot{\\theta}^{2}\\right) \\hat{e}_{r}+(r \\ddot{\\theta}+2 \\dot{r} \\dot{\\theta}) \\hat{e}_{\\theta} \\end{array} $$",
		"description": "",
		"definition": {
			"(\\hat{e}_{r},\\hat{e}_{\\theta})" : "Unit vectors in polar coordinates",
			"r" : "Radial distance",
			"\\theta": "Angular position"
		},
		"keywords": ["Polar", "Kinematics", "2D"],
		"tags": ["Mathematics", "Physics", "Kinematics","Dynamics"],
		"href":"https://en.wikipedia.org/wiki/Polar_coordinate_system",
		"contributed_by": ""
	},
	{
		"name": "Equations of Motion (2D): Polar Coordinates",
		"latex": "$$ \\begin{array}{l} F_{r}=m a_{r}=m\\left(\\ddot{r}-r \\dot{\\theta}^{2}\\right) \\\\F_{\\theta}=m a_{\\theta}=m(r \\ddot{\\theta}+2 \\dot{r} \\dot{\\theta}) \\end{array}$$",
		"description": "",
		"definition": {
			"(\\hat{e}_{r},\\hat{e}_{\\theta})" : "Unit vectors in polar coordinates",
			"r" : "Radial distance",
			"\\theta": "Angular position",
			"m" : "Mass"
		},
		"keywords": ["Polar", "Kinematics", "2D"],
		"tags": ["Mathematics", "Physics", "Kinematics","Dynamics"],
		"href":"https://en.wikipedia.org/wiki/Polar_coordinate_system",
		"contributed_by": ""
	},
	{
		"name": "Spherical Coordinates: Unit Vectors",
		"latex": "$$ \\begin{array}{l} \\hat{e}_{r}=\\cos \\theta \\cos \\phi \\hat{i}+\\sin \\theta \\cos \\phi \\hat{j}+\\sin \\phi \\hat{k} \\\\ \\hat{e}_{\\theta}=-\\sin \\theta \\hat{i}+\\cos \\theta \\hat{j} \\\\ \\hat{e}_{\\phi}=-\\cos \\theta \\sin \\phi \\hat{i}-\\sin \\theta \\sin \\phi \\hat{j}+\\cos \\phi \\hat{k} \\end{array}$$",
		"description": "A spherical coordinate system is a coordinate system for three-dimensional space where the position of a point is specified by three numbers: the radial distance of that point from a fixed origin, its polar angle measured from a fixed zenith direction, and the azimuthal angle of its orthogonal projection on a reference plane that passes through the origin and is orthogonal to the zenith, measured from a fixed reference direction on that plane. It can be seen as the three-dimensional version of the polar coordinate system.",
		"definition": {
			"(\\hat{i},\\hat{j}, \\hat{k})" : "Unit vectors in cartesian coordinates",
			"(\\hat{e}_{r},\\hat{e}_{\\theta},\\hat{e}_{\\phi})" : "Unit vectors in spherical coordinates",
			"\\theta": "Azimuth",
			"\\phi" : "Declination"
		},
		"keywords": ["Angles", "Spherical", "Geometry", "point"],
		"tags": ["Mathematics", "Geometry"],
		"href":"https://en.wikipedia.org/wiki/Polar_coordinate_system",
		"contributed_by": "Grégoire de Saint-Vincent"
	},
	{
		"name": "Kinematic Equations: Spherical Coordinates",
		"latex": "$$ \\begin{array}{l} \\vec{r}=r \\vec{e}_{r} \\\\ \\vec{v}=\\dot{r} \\hat{e}_{r}+r \\dot{\\theta} \\cos \\phi \\hat{e}_{\\theta}+r \\dot{\\phi} \\hat{e}_{\\phi} \\\\ \\vec{a}=\\left(\\ddot{r}-r \\dot{\\theta}^{2} \\cos ^{2} \\phi-r \\dot{\\phi}^{2}\\right) \\hat{e}_{r} \\\\ +(2 \\dot{r} \\dot{\\theta} \\cos \\phi+r \\ddot{\\theta} \\cos \\phi-2 r \\dot{\\theta} \\dot{\\phi} \\sin \\phi) \\hat{e}_{\\theta} \\\\ +\\quad\\left(2 \\dot{r} \\dot{\\phi}+r \\dot{\\phi}^{2} \\sin \\phi \\cos \\phi+r \\ddot{\\phi}\\right) \\vec{e}_{\\phi} \\end{array} $$",
		"description": "",
		"definition": {
			"(\\hat{e}_{r},\\hat{e}_{\\theta})" : "Unit vectors in polar coordinates",
			"r" : "Radial distance",
			"\\theta": "Angular position"
		},
		"keywords": ["Polar", "Kinematics", "2D"],
		"tags": ["Mathematics", "Physics", "Kinematics","Dynamics"],
		"href":"https://en.wikipedia.org/wiki/Polar_coordinate_system",
		"contributed_by": ""
	},
	{
		"name": "Equations of Motion (3D): Spherical Coordinates",
		"latex": "$$ \\begin{aligned}F_{r} &=m a_{r}=m\\left(\\ddot{r}-r \\dot{\\theta}^{2} \\cos ^{2} \\phi-r \\dot{\\phi}^{2}\\right) \\\\ F_{\\theta} &=m a_{\\theta}=m(2 \\dot{r} \\dot{\\theta} \\cos \\phi+r \\ddot{\\theta} \\cos \\phi-2 r \\dot{\\theta} \\dot{\\phi} \\sin \\phi) \\\\ F_{\\phi} &=m a_{\\phi}=m\\left(2 \\dot{r} \\dot{\\phi}+r \\dot{\\phi}^{2} \\sin \\phi \\cos \\phi+r \\ddot{\\phi}\\right) \\end{aligned} $$",
		"description": "",
		"definition": {
			"(\\hat{i},\\hat{j}, \\hat{k})" : "Unit vectors in cartesian coordinates",
			"(\\hat{e}_{r},\\hat{e}_{\\theta},\\hat{e}_{\\phi})" : "Unit vectors in spherical coordinates",
			"\\theta": "Azimuth",
			"\\phi" : "Declination"
		},
		"keywords": ["Polar", "Kinematics", "2D"],
		"tags": ["Mathematics", "Physics", "Kinematics","Dynamics"],
		"href":"https://en.wikipedia.org/wiki/Polar_coordinate_system",
		"contributed_by": ""
	},
	{
		"name": " (Unit) Quaternion Representation",
		"latex": "$$\\mathbf{q}=\\left[q_{0}, q_{1}, q_{2}, q_{3}\\right]^{T}=\\left[\\begin{array}{c}q_{0} \\\\ \\mathbf{q}_{1: 3}\\end{array}\\right] \\quad ; \\quad \\sqrt{q_1^2+q_2^2+q_3^2+q_4^2} \\, = \\, 1$$",
		"description": "Unit quaternions, also known as versors, provide a convenient mathematical notation for representing orientations and rotations of objects in three dimensions. Compared to Euler angles they are simpler to compose and avoid the problem of gimbal lock. Compared to rotation matrices they are more compact, more numerically stable, and more efficient.",
		"definition": {
			"q_0" : "Scalar part of the quaternion vector",
			"\\mathbf{q}_{1: 3}": "Vector part of the quaternion vector"
		},
		"keywords": ["Attitude Dynamics","Hamilton", "Quaternion", "Rotation"],
		"tags": ["Mathematics", "Physics", "Kinematics","Dynamics"],
		"href":"https://en.wikipedia.org/wiki/Quaternion",
		"contributed_by": ""
	},
	{
		"name": " Quaternion Multiplication",
		"latex": "$$ \\begin{aligned} \\mathbf{q} \\otimes \\mathbf{p} &=\\left[\\begin{array}{cc} q_{0} p_{0}-\\mathbf{q}_{1: 3}^{T} \\mathbf{p}_{1: 3} & \\\\ q_{0} \\mathbf{p}_{1: 3}+p_{0} \\mathbf{q}_{1: 3}-\\mathbf{q}_{1: 3}  \\times \\mathbf{p}_{1: 3} \\end{array}\\right]  \\end{aligned}$$",
		"description": "",
		"definition": {
			"\\mathbf{p, \\,q}": "Quaternions",
			"\\otimes": "Quaternion multiplication",
			"q_0" : "Scalar part of the quaternion vector",
			"\\mathbf{q}_{1: 3}": "Vector part of the quaternion vector"
		},
		"keywords": ["Attitude Dynamics","Hamilton", "Quaternion", "Rotation"],
		"tags": ["Mathematics", "Physics", "Kinematics","Dynamics"],
		"href":"https://en.wikipedia.org/wiki/Quaternion",
		"contributed_by": ""
	},
	{
		"name": " Quaternion Inverse",
		"latex": "$$ \\begin{array}{l} \\mathbf{q}^{-1}=\\frac{\\overline{\\mathbf{q}}}{\\|\\mathbf{q}\\|} \\quad ; \\quad \\overline{\\mathbf{q}}=\\left[\\begin{array}{c} q_{0} \\\\ -\\mathbf{q}_{1: 3} \\end{array}\\right]   \\end{array}$$",
		"description": "Inverse of a 4-vector quaternion.",
		"definition": {
			"\\mathbf{p, \\,q}": "Quaternions",
			"\\otimes": "Quaternion multiplication",
			"q_0" : "Scalar part of the quaternion vector",
			"\\mathbf{q}_{1: 3}": "Vector part of the quaternion vector"
		},
		"keywords": ["Attitude Dynamics","Hamilton", "Quaternion", "Rotation"],
		"tags": ["Mathematics", "Physics", "Kinematics","Dynamics"],
		"href":"https://en.wikipedia.org/wiki/Quaternion",
		"contributed_by": ""
	},
	{
		"name": "Direction Cosine Matrix",
		"latex": "$$ R=\\left[\\begin{array}{ccc} \\cos \\left(\\theta_{x^{\\prime}, x}\\right) & \\cos \\left(\\theta_{x^{\\prime}, y}\\right) & \\cos \\left(\\theta_{x^{\\prime}, z}\\right) \\\\ \\cos \\left(\\theta_{y^{\\prime}, x}\\right) & \\cos \\left(\\theta_{y^{\\prime}, y}\\right) & \\cos \\left(\\theta_{y^{\\prime}, z}\\right) \\\\ \\cos \\left(\\theta_{z^{\\prime}, x}\\right) & \\cos \\left(\\theta_{z^{\\prime}, y}\\right) & \\cos \\left(\\theta_{z^{\\prime}, z}\\right) \\end{array}\\right]$$",
		"description": "",
		"definition": {
			"x', y' ,z'": "rotated axes",
			"x, y ,z": "original axes",
			"R" : "Rotation Transformation Matrix"
		},
		"keywords": ["Attitude Dynamics","Hamilton", "Quaternion", "Rotation"],
		"tags": ["Mathematics", "Physics", "Kinematics","Dynamics"],
		"href":"https://en.wikipedia.org/wiki/Quaternion",
		"contributed_by": ""
	},
	{
		"name": "Ideal Gas Law",
		"latex": "$$ PV = nRT = n k_B N_A T$$",
		"description": "The ideal gas law, also called the general gas equation, is the equation of state of a hypothetical ideal gas. It is a good approximation of the behavior of many gases under many conditions",
		"definition": {
			"P": "Pressure",
			"V": "Volume",
			"T": "Temperature",
			"n": "Number of moles",
			"R": "Ideal Gas Constant",
			"k_B": "Boltzmann Constant",
			"N_A": "Avogadro's number"
		},
		"keywords": ["Gas dynamics", "Ideal Gas", "Gas law", "Thermodynamics"],
		"tags": ["Thermodynamics", "Physics", "Propulsion"],
		"href":"https://en.wikipedia.org/wiki/Ideal_gas_law",
		"contributed_by": ""
	},
	{
		"name": "Scalar (dot) Product of Vectors",
		"latex": "$$ \\vec{a} \\cdot \\vec{b} \\, = \\, a_1 b_1 \\, + \\, a_2 b_2 \\, + \\, a_3 b_3 $$",
		"description": "",
		"definition": {},
		"keywords": ["Vector","Vector Algebra", "dot product", "scalar"],
		"tags": ["Mathematics", "Physics", "Kinematics","Algebra"],
		"href":"https://en.wikipedia.org/wiki/Euclidean_vector",
		"contributed_by": ""
	},
	{
		"name": "Vector (cross) Product",
		"latex": "$$ \\begin{aligned} \\vec{a} \\times \\vec{b} =\\left(a_{2} b_{3}-a_{3} b_{2}\\right) \\hat{i}-\\left(a_{1} b_{3}-a_{3} b_{1}\\right) \\hat{j}+\\left(a_{1} b_{2}-a_{2} b_{1}\\right) \\hat{k} \\end{aligned}$$",
		"description": "",
		"definition": {},
		"keywords": ["Vector","Vector Algebra", "cross product", "vector"],
		"tags": ["Mathematics", "Physics", "Kinematics","Algebra"],
		"href":"https://en.wikipedia.org/wiki/Euclidean_vector",
		"contributed_by": ""
	},
	{
		"name": "Vector Gradient",
		"latex": "$$ \\nabla g \\, = \\, \\frac{\\delta g_x}{\\delta  x} \\hat{i} \\, + \\, \\frac{\\delta g_y}{ \\delta y} \\hat{j} \\, + \\, \\frac{\\delta g_z}{ \\delta z} \\hat{k} \\, $$",
		"description": "",
		"definition": {
			"g":"Scalar valued function"
		},
		"keywords": ["Vector","Vector Algebra", "cross product", "vector"],
		"tags": ["Mathematics", "Physics", "Kinematics","Algebra"],
		"href":"https://en.wikipedia.org/wiki/Euclidean_vector",
		"contributed_by": ""
	},
	{
		"name": "Vector Divergence",
		"latex": "$$ \\nabla \\cdot \\vec{V} \\, = \\, \\frac{\\delta V_x}{\\delta  x} \\, + \\, \\frac{\\delta V_y}{ \\delta y} \\, + \\, \\frac{\\delta V_z}{ \\delta z} \\, $$",
		"description": "",
		"definition": {
			"\\vec{V}":"Vector valued function"
		},
		"keywords": ["Vector","Vector Algebra", "cross product", "vector"],
		"tags": ["Mathematics", "Physics", "Kinematics","Algebra"],
		"href":"https://en.wikipedia.org/wiki/Euclidean_vector",
		"contributed_by": ""
	},
	{
		"name": "Vector Curl",
		"latex": "$$\\nabla \\times \\vec{V}=\\left|\\begin{array}{ccc}\\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ \\frac{\\delta}{\\delta x} & \\frac{\\delta}{\\delta y} & \\frac{\\delta}{\\delta z} \\\\ V_x & V_y & V_z\\end{array}\\right|$$",
		"description": "",
		"definition": {
			"\\vec{V}":"Vector valued function"
		},
		"keywords": ["Vector","Vector Algebra", "cross product", "vector"],
		"tags": ["Mathematics", "Physics", "Kinematics","Algebra"],
		"href":"https://en.wikipedia.org/wiki/Euclidean_vector",
		"contributed_by": ""
	},
	{
		"name": "Arithematic Mean",
		"latex": "$$ \\overline{x} \\, = \\, \\frac{\\sum_i^n x_i}{n}$$",
		"description": "",
		"definition": {
			"\\overline{x}" : "Sample Mean",
			"{x_i}":"observation/measurement",
			"n": "Total number of samples"

		},
		"keywords": ["statistics","Mean", "average", "population"],
		"tags": ["Mathematics", "Statistics"],
		"href":"https://en.wikipedia.org/wiki/Euclidean_vector",
		"contributed_by": ""
	},
	{
		"name": "Electric Current",
		"latex": "$$ i \\, = \\, \\frac{dq}{dt}$$",
		"description": "Current is the time rate of flow of electric charge. Charge is the quantity of electricity responsible for electric phenomena.",
		"definition": {
			"q" : "Electric Charge (C)",
			"i":"Electric current (A)"
		},
		"keywords": ["current","charge"],
		"tags": ["Electrical engineering", "Electrodynamics"],
		"href":"https://en.wikipedia.org/wiki/Electric_current",
		"contributed_by": ""
	},
	{
		"name": "Electric Voltage",
		"latex": "$$ v \\, = \\, \\frac{dw}{dq}$$",
		"description": "The voltage across an element is the work required to move a positive charge of 1 coulomb from the first terminal through the element to the second terminal",
		"definition": {
			"q" : "Electric Charge (C)",
			"w":"Work/Energy (J)"
		},
		"keywords": ["potential","charge"],
		"tags": ["Electrical engineering", "Electrodynamics"],
		"href":"https://en.wikipedia.org/wiki/Electric_current",
		"contributed_by": ""
	},
	{
		"name": "Electric Resistance",
		"latex": "$$ R \\, = \\, \\frac{\\rho L}{A}$$",
		"description": "Resistance is the physical property of an element or device that impedes the flow of current",
		"definition": {
			"\\rho" : "Density (kg/m\\(^3\\)))",
			"L":"Length of the conductor (m)",
			"A": "Cross-section area"
		},
		"keywords": ["potential","resistance"],
		"tags": ["Electrical engineering", "Electrodynamics"],
		"href":"https://en.wikipedia.org/wiki/Electric_current",
		"contributed_by": ""
	},
	{
		"name": "Ohm's Law",
		"latex": "$$ v \\, = \\, R\\, i$$",
		"description": "Resistance is the physical property of an element or device that impedes the flow of current",
		"definition": {
			"v" : "Voltage (V)",
			"R":"Resistance(\\(\\Omega\\))",
			"i": "Current (A)"
		},
		"keywords": ["potential","resistance"],
		"tags": ["Electrical engineering", "Electrodynamics"],
		"href":"https://en.wikipedia.org/wiki/Electric_current",
		"contributed_by": ""
	},
	{
		"name": "Quality Factor: Parallel Resonant Circuit",
		"latex": "$$ Q=\\omega_{0} C R=\\frac{R}{\\omega_{0} L} \\quad ; \\quad \\omega_0 \\, = \\, \\frac{1}{LC} $$",
		"description": "A resonant circuit is a combination of frequency-sensitive elements to provide a frequency-selective response.",
		"definition": {
			" \\omega_0" : "Resonant Frequency ",
			"R":"Resistance(\\(\\Omega\\))",
			"L": "Inductance (H)",
			"C": "Capacitance"
		},
		"keywords": ["potential","resistance"],
		"tags": ["Electrical engineering", "Electrodynamics"],
		"href":"https://en.wikipedia.org/wiki/Electric_current",
		"contributed_by": ""
	},
	{
		"name": "Quality Factor: Series Resonant Circuit",
		"latex": "$$ Q=\\frac{1}{\\omega_{0} C R}=\\frac{\\omega_{0} L}{R} \\quad ; \\quad \\omega_0 \\, = \\, \\frac{1}{LC} $$",
		"description": "A resonant circuit is a combination of frequency-sensitive elements to provide a frequency-selective response.",
		"definition": {
			" \\omega_0" : "Resonant Frequency ",
			"R":"Resistance(\\(\\Omega\\))",
			"L": "Inductance",
			"C": "Capacitance"
		},
		"keywords": ["potential","resistance"],
		"tags": ["Electrical engineering", "Electrodynamics"],
		"href":"https://en.wikipedia.org/wiki/Electric_current",
		"contributed_by": ""
	},
	{
		"name": "Maxwell's Equations",
		"latex": "$$ \\begin{aligned} &\\mathbf{\\nabla} \\cdot \\mathbf{D}=\\rho \\quad \\oint_{\\text {A}} \\mathbf{D} \\cdot d \\mathbf{S}=Q=\\int_{\\text {V}} \\rho d v\\\\ &\\mathbf{\\nabla} \\times \\mathbf{E}=0 \\quad \\oint \\Sigma \\cdot d \\mathbf{L}=0\\\\ &\\mathbf{\\nabla} \\times \\mathbf{H}=\\mathbf{J} \\quad \\oint \\mathbf{H} \\cdot d \\mathbf{L}=I=\\int_A \\mathbf{J} \\cdot d \\mathbf{S}\\\\ &\\nabla \\cdot \\mathbf{B}=0 \\quad \\oint \\mathbf{B} \\cdot d \\mathbf{S}=0 \\end{aligned} $$",
		"description": "Maxwell's equations are partial differential equations that relate the electric and magnetic fields to each other and to the electric charges and currents. Often, the charges and currents are themselves dependent on the electric and magnetic fields via the Lorentz force equation and the constitutive relations. These all form a set of coupled partial differential equations which are often very difficult to solve:",
		"definition": {
		},
		"keywords": ["Maxwell","light", "Electromagnetic"],
		"tags": ["Electrical engineering", "Electromagnetic"],
		"href":"https://en.wikipedia.org/wiki/Maxwell%27s_equations",
		"contributed_by": ""
	},
	{
		"name": "Sound Pressure Level: Launch",
		"latex": "$$ I=20 \\log _{10}\\left(\\frac{F}{2 \\times 10^{-5}}\\right) \\mathrm{dB}$$",
		"description": "The severe acoustic/vibration environment during launch is due to both the operation of the launch vehicle’s main engines, and also the aerodynamic buffeting as the vehicle rises through the lower region of the Earth’s atmosphere. Measurement of the field is generally made in dB.",
		"definition": {
			"I" : "Sound pressure Level (dB)",
			"F" : "Acoustic field intensity (Pa)"
		},
		"keywords": ["Acoustic field","vibration", "rocket launch", "environment", "rocket"],
		"tags": ["Aerospace engineering", "Space Engineering"],
		"href":"https://arc.aiaa.org/doi/pdf/10.2514/3.46974",
		"contributed_by": ""
	},
	{
		"name": "Air density variation with Altitude (General form)",
		"latex": "$$ \\rho=\\rho_{\\mathrm{SL}} \\exp \\left(\\frac{-g M_{i}}{R^{*} T} h\\right)$$",
		"description": "Relation between air density and altitude for hydrostatic equillibrium.",
		"definition": {
			"\\rho_{SL}": "Density at sea level",
			"T" : "Atmospheric Temperature",
			"R" : "Universal gas constant",
			"M": "Molecular mass",
			"g": "altitude-dependent gravitational acceleration",
			"h": "Altitude"
		},
		"keywords": ["Fluid","Density", "air", "atmosphere"],
		"tags": ["Aerospace engineering", "Fluid dynamics"],
		"href":"https://en.wikipedia.org/wiki/Density_of_air",
		"contributed_by": ""
	},
	{
		"name": "Air density variation with Scale height (Orbit)",
		"latex": "$$ \\rho=\\rho_{\\mathrm{p}}\\left[1+\\frac{\\mu_{0}}{H_{\\mathrm{p}}}\\left(r-r_{\\mathrm{p}}\\right)\\right]^{-1 / \\mu_{0}}$$",
		"description": "Relation between air density and altitude for hydrostatic equillibrium.",
		"definition": {
			"\\rho": "Equivalent density",
			"\\rho_{p}": "Density at perigee",
			"r": "Instantaneous radius",
			"r_p" : "radius of perigee",
			"\\mu_0": "Altitude gradient of scale height",
			"H": "Scale height"
		},
		"keywords": ["Fluid","Density", "air", "atmosphere"],
		"tags": ["Aerospace engineering", "Fluid dynamics"],
		"href":"https://scholar.google.com/scholar_url?url=https://books.google.com/books%3Fhl%3Den%26lr%3D%26id%3DcCYP0rVR_IEC%26oi%3Dfnd%26pg%3DPT10%26dq%3Dspacecraft%2Bsystems%2Bengineering%2Bwiley%26ots%3DIHezW8BGcK%26sig%3DK4hXdcdm24vRlwRMjN-fsVHPRt8&hl=en&sa=T&oi=gsb&ct=res&cd=0&d=14862668944722956238&ei=PVRiX8_xM9a3yQTZ6b34BQ&scisig=AAGBfm18G5uMS-I62QEX28nbHmiQfTZ4fA",
		"contributed_by": ""
	},
	{
		"name": "Angular Momentum of a Rigid body",
		"latex": "$$ \\mathbf{H} \\; = \\; \\mathbf{I} \\, \\omega$$",
		"description": "The angular momentum of a single rigid body referred to its centre-of-mass",
		"definition": {
			"\\mathbf{H}" : "Angular Momentum",
			"\\mathbf{I}" : "Inertia Matrix",
			"\\omega" : "Angular velocity"
		},
		"keywords": ["Rigid body dynamics","Dynamics", "Inertia"],
		"tags": ["Aerospace engineering", "Dynamics"],
		"href":"https://en.wikipedia.org/wiki/Rigid_body_dynamics",
		"contributed_by": ""
	},
	{
		"name": "Rotational Kinetic Energy (Rigid body)",
		"latex": "$$ E=\\frac{1}{2}\\left(\\mathbf{H} \\cdot \\omega\\right) \\; = \\;  \\frac{1}{2}\\left(\\mathbf{I} \\omega \\cdot \\omega\\right)$$",
		"description": "Rotational energy or angular kinetic energy is kinetic energy due to the rotation of an object and is part of its total kinetic energy. Looking at rotational energy separately around an object's axis of rotation, the following dependence on the object's moment of inertia is observed",
		"definition": {
			"\\mathbf{H}" : "Angular Momentum",
			"{E}" : "Kinetic Energy",
			"\\mathbf{I}" : "Inertia Matrix",
			"\\omega" : "Angular velocity"
		},
		"keywords": ["Rigid body dynamics","Dynamics", "Inertia"],
		"tags": ["Aerospace engineering", "Dynamics"],
		"href":"https://en.wikipedia.org/wiki/Rotational_energy",
		"contributed_by": ""
	},
	{
		"name": "Attitude Response: 3-axis stabilized spacecraft",
		"latex": "$$ \\begin{array}{l} I_{x x} \\dot{\\omega}_{x}-\\left(I_{y y}-I_{z z}\\right) \\omega_{y} \\omega_{z}=T_{x} \\\\ I_{y y} \\dot{\\omega}_{y}-\\left(I_{z z}-I_{x x}\\right) \\omega_{z} \\omega_{x}=T_{y} \\\\ I_{z z} \\dot{\\omega}_{z}-\\left(I_{x x}-I_{y y}\\right) \\omega_{x} \\omega_{y}=T_{z} \\end{array}$$",
		"description": "The spacecraft is be treated as a single rigid body.",
		"definition": {
			"\\mathbf{I}" : "Moment of Inertia",
			"\\omega" : "Angular velocity",
			"\\mathbf{T}": "Torque"
		},
		"keywords": ["Rigid body dynamics","Dynamics", "Inertia", "Attitude motion", "Attitude control"],
		"tags": ["Aerospace engineering", "Dynamics"],
		"href":"https://en.wikipedia.org/wiki/Rigid_body_dynamics",
		"contributed_by": ""
	},
	{
		"name": "Flex modes for Appendages",
		"latex": "$$ f=\\left(K^{2} \\pi / 8 L^{2}\\right) \\sqrt{(E I / \\rho A)} \\quad \\mathrm{Hz}$$",
		"description": "The appendages of spacecraft in particular can be very flimsy structures and their fundamental frequency—their lowest modal frequency—can be very low. Some parts can be cantilevered outwards from the central body and each will have bending and torsional modes. The frequencies of the bending modes of a single, rigidly attached uniform cantilever are given by the above formula.However, on a spacecraft it is unlikely that the attachment will be rigid, and the actual fundamental frequency may be only about 50% of the value given by this equation.",
		"definition": {
			"\\mathbf{K}" : "1, 2, 3, 5, 7 (modes)",
			"E" : "Young's modulus (N/m\\(^2\\)",
			"I": "Second moment of area (m\\(^4\\)",
			"L": "Length of the component (m)",
			"\\rho": "Material density (kg/m\\(^3\\)",
			"A": "Cross-section area (m\\(^2\\)"
		},
		"keywords": ["Rigid body dynamics","Dynamics", "Inertia", "Structure", "Appendages"],
		"tags": ["Aerospace engineering", "Structural Engineering"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Inertia Invariance",
		"latex": "$$ I_{x x}+I_{y y}+I_{z z}=2 \\int r^{2} \\mathrm{d} m=2 I_{O}$$",
		"description": "",
		"definition": {
			"I_{x x}, I_{y y}, I_{z z}" : "Principal moments of inertia",
			"I_o": "Second moment of mass around origin"
		},
		"keywords": ["Rigid body dynamics","Dynamics", "Inertia", "Structure", "Appendages"],
		"tags": ["Aerospace engineering", "Structural Engineering"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Earth's gravitational potential",
		"latex": "$$\\begin{aligned} U(r, \\Phi, \\Lambda)=& \\frac{\\mu}{r}\\left\\{-1+\\sum_{n=2}^{\\infty}\\left[\\left(\\frac{R_{E}}{r}\\right)^{n} J_{n} P_{n 0}(\\cos \\Phi)\\right.\\right.\\\\ &\\left.\\left.+\\sum_{m=1}^{n}\\left(\\frac{R_{E}}{r}\\right)^{n}\\left(C_{n m} \\cos m \\Lambda+S_{n m} \\sin m \\Lambda\\right) P_{n m}(\\cos \\Phi)\\right]\\right\\} \\end{aligned}$$",
		"description": "The appendages of spacecraft in particular can be very flimsy structures and their fundamental frequency—their lowest modal frequency—can be very low. Some parts can be cantilevered outwards from the central body and each will have bending and torsional modes. The frequencies of the bending modes of a single, rigidly attached uniform cantilever are given by the above formula.However, on a spacecraft it is unlikely that the attachment will be rigid, and the actual fundamental frequency may be only about 50% of the value given by this equation.",
		"definition": {
			"U" : "Gravitational potential",
			"\\mu": "Standard gravitational parameter",
			"r": "Instantaneous position",
			"R_E" : "Radius of Earth",
			"P_{nm}": "Legendre polynomials",
			"\\Phi, \\Lambda": "Latitude, Longitude",
			"J_n, \\; C_{nm}, \\; S_{nm}" : "Coefficients of mass distribution"
		},
		"keywords": ["Gravity","Gravitaional potential", "Harmonics", "Mass distribution", "Earth"],
		"tags": ["Aerospace engineering", "Astrodynamics"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Nodal Regression per orbit",
		"latex": "$$\\bar{\\Omega}=3\\pi \\frac{J_{2} R_{E}^{2}}{p^{2}}  \\cos i \\quad \\text{rad/rev}$$",
		"description": "The equatorial bulge produces a torque that rotates the angular momentum vector. For prograde orbits (i < 90◦), the orbit rotates in a westerly direction, leading to a regression of the line of nodes",
		"definition": {
			"J_2" : "Second harmonic coefficient",
			"\\Omega": "Right Ascension of Ascending Node",
			"i": "Inclination",
			"R_E" : "Radius of Earth",
			"p": "Semi-latus rectum"
		},
		"keywords": ["Gravity","Gravitaional potential", "Harmonics", "Mass distribution", "Earth", "Orbit"],
		"tags": ["Aerospace engineering", "Astrodynamics", "Orbital Mechanics"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "GS Visibility: Semi-angle",
		"latex": "$$\\phi=-\\varepsilon+\\cos ^{-1}\\left(\\frac{R_{\\mathrm{E}}}{R_{\\mathrm{E}}+h} \\cos \\varepsilon\\right)$$",
		"description": "A satellite is visible at all points on the Earth’s surface within a circle that is centred on the sub-satellite point, and whose diameter increases with satellite altitude. However, signals from satellites at the horizon limit are considerably attenuated by the atmosphere, and so for practical purposes the surface coverage is restricted to the region in which the satellite elevation above the horizon is greater than ∼5 degrees. If it is visible down to elevations equal to \\(\\epsilon\\), typically 5 deg to 10 deg, then the geocentric semi-angle \\(\\phi\\) over which it is visible is given by the above formula.",
		"definition": {
			"\\phi" : "Geo-centric semi angle",
			"\\epsilon": "Elevation",
			"R_E" : "Radius of Earth",
			"h" : "Altitude"
		},
		"keywords": ["Mission analysis", "Mission design", "Ground station", "coverage"],
		"tags": ["Aerospace engineering", "Mission engineering"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "GS Visibility: Slant range",
		"latex": "$$s=\\left(R_{\\mathrm{E}}+h\\right) \\sin \\phi / \\cos \\varepsilon$$",
		"description": "A satellite is visible at all points on the Earth’s surface within a circle that is centred on the sub-satellite point, and whose diameter increases with satellite altitude. However, signals from satellites at the horizon limit are considerably attenuated by the atmosphere, and so for practical purposes the surface coverage is restricted to the region in which the satellite elevation above the horizon is greater than ∼5 degrees. If it is visible down to elevations equal to \\(\\epsilon\\), typically 5 deg to 10 deg, then the geocentric semi-angle \\(\\phi\\) over which it is visible is given by the above formula.",
		"definition": {
			"\\phi" : "Geo-centric semi angle",
			"\\epsilon": "Elevation",
			"R_E" : "Radius of Earth",
			"h" : "Altitude",
			"s": "Slant range (range from GS"
		},
		"keywords": ["Mission analysis", "Mission design", "Ground station", "coverage"],
		"tags": ["Aerospace engineering", "Mission engineering"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "GS Visibility: Overhead Pass duration",
		"latex": "$$ \\tau \\, = \\, \\frac{2\\phi}{\\omega_{ES}} \\quad ; \\quad \\omega_{ES}^2 \\, = \\, \\omega_E^2 + \\omega^2 - 2\\omega_E\\omega \\cos i$$",
		"description": "A satellite is visible at all points on the Earth’s surface within a circle that is centred on the sub-satellite point, and whose diameter increases with satellite altitude. However, signals from satellites at the horizon limit are considerably attenuated by the atmosphere, and so for practical purposes the surface coverage is restricted to the region in which the satellite elevation above the horizon is greater than ∼5 degrees. If it is visible down to elevations equal to \\(\\epsilon\\), typically 5 deg to 10 deg, then the geocentric semi-angle \\(\\phi\\) over which it is visible is given by the above formula.",
		"definition": {
			"\\phi" : "Geo-centric semi angle",
			"{\\omega_{ES}}": "Angular velocity of spacecraft w.r.t ground",
			"{\\omega}" : "Satellite orbital angular velocity",
			"i" : "Orbit inclination"
		},
		"keywords": ["Mission analysis", "Mission design", "Ground station", "coverage", "Orbit"],
		"tags": ["Aerospace engineering", "Mission engineering"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "GS Visibility: Non-overhead Pass duration",
		"latex": "$$ \\tau \\, = \\, \\frac{2\\sin ^{-1}\\left(\\sin ^{2} \\phi-\\tan ^{2} \\alpha \\cos ^{2} \\phi\\right)^{1 / 2}}{\\omega_{ES}} \\quad ; \\quad \\omega_{ES}^2 \\, = \\, \\omega_E^2 + \\omega^2 - 2\\omega_E\\omega \\cos i$$",
		"description": "Duration of a non-overhead pass",
		"definition": {
			"\\phi" : "Geo-centric semi angle",
			"{\\omega_{ES}}": "Angular velocity of spacecraft w.r.t ground",
			"{\\omega}" : "Satellite orbital angular velocity",
			"i" : "Orbit inclination",
			"\\alpha" : "Angle deviation from overhead plane"
		},
		"keywords": ["Mission analysis", "Mission design", "Ground station", "coverage", "Orbit"],
		"tags": ["Aerospace engineering", "Mission engineering"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "GS Visibility: Maximum elevation",
		"latex": "$$ \\varepsilon_{\\max }=\\tan ^{-1}\\left[\\cot \\alpha-\\left(\\frac{R_{\\mathrm{E}}}{R_{\\mathrm{E}}+h}\\right) \\operatorname{cosec} \\alpha\\right]$$",
		"description": "Maximum elevation of a non-overhead pass",
		"definition": {
			"\\varepsilon_{max}": "Maximum elevation",
			"R_E" : "Radius of Earth",
			"h" : "Altitude",
			"\\alpha" : "Angle deviation from overhead plane"
		},
		"keywords": ["Mission analysis", "Mission design", "Ground station", "coverage", "Orbit"],
		"tags": ["Aerospace engineering", "Mission engineering"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Orbit Lifetime",
		"latex": "$$ \\begin{align} \\tau &\\sim \\frac{\\mathrm{e}_{0}^{2}}{2 B}\\left(1-\\frac{11}{6} \\mathrm{e}_{0}+\\frac{29}{16} \\mathrm{e}_{0}^{2}+\\frac{7}{8} \\frac{\\mathrm{H}}{a_{0}}\\right) \\\\ B &\\sim \\sqrt{\\left(\\frac{\\mu}{a_{0}^{3}}\\right)} \\frac{A C_{\\mathrm{D}}}{M} \\rho_{p 0} a_{0} \\mathrm{e}_{0} I_{1}\\left(\\frac{a_{0} \\mathrm{e}_{0}}{H}\\right) \\exp \\left(-\\mathrm{e}_{0}\\left(1+\\frac{a_{0}}{H}\\right)\\right) \\end{align}$$",
			"description": "For LEO vehicles, aerodynamic drag will eventually result in re-entry. For such cases, lifetime of an uncontrolled spacecraft is given by the above formula.",
		"definition": {
			"\\mu": "Standard gravitational parameter",
			"\\tau": "orbit lifetime",
			"a_0": "Initial semi-major axis",
			"e_0": "Initial Eccentricity",
			"I_1": "Bessel function first-kind first-order",
			"H" : "Scale Height near perigee",
			"C_D": "Drag coefficient",
			"M": "Mass",
			"\\rho{p_0}": "Air density at initial perigee"
		},
		"keywords": ["Mission analysis", "Mission design", "Ground station", "coverage", "Orbit"],
		"tags": ["Aerospace engineering", "Mission engineering"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Rocket Thrust",
		"latex": "$$T=\\dot{m} V_{e}+A_{e}\\left(p_{e}-p_{a}\\right) $$",
			"description": "For LEO vehicles, aerodynamic drag will eventually result in re-entry. For such cases, lifetime of an uncontrolled spacecraft is given by the above formula.",
		"definition": {
			"T": "Thrust",
			"\\dot{m}": "Mass flow rate",
			"V_e": "Exhaust velocity",
			"A_e": "Exhaust plane area",
			"p_e": "Pressure at exhaust",
			"p_a" : "Ambient pressure"
		},
		"keywords": ["Rocket", "Propulsion", "thrust"],
		"tags": ["Aerospace engineering", "Mission engineering"],
		"href":"https://www.grc.nasa.gov/www/k-12/airplane/rockth.html",
		"contributed_by": ""
	},
	{
		"name": "Current density: Semiconductor",
		"latex": "$$ J=\\left(n \\mu_{n}+p \\mu_{p}\\right) e \\mathbf{E}=\\sigma \\mathbf{E}$$",
		"description": "In semiconducton both boles and electrons contribute to electrical conduction. With an applied electric field E, the expression for current density is",
		"definition": {
			"J" : "Current density",
			"n,\\,p":"Concentration of electrons and holes ",
			"\\mu_n,\\,\\mu_p":"Mobilities of electrons and holes ",
			"\\mathbf{E}": "Applied electric field"
		},
		"keywords": ["potential","semiconductor", "current"],
		"tags": ["Electrical engineering", "Semiconductors"],
		"href":"https://en.wikipedia.org/wiki/Electric_current",
		"contributed_by": ""
	},
	{
		"name": "Conductivity: Semiconductor",
		"latex": "$$ \\sigma=\\left(n \\mu_{n}+p \\mu_{p}\\right) e $$",
		"description": "In semiconducton both boles and electrons contribute to electrical conduction. Conductivity depends on the number of charge carriers and their mobility",
		"definition": {
			"n,\\,p":"Concentration of electrons and holes ",
			"\\mu_n,\\,\\mu_p":"Mobilities of electrons and holes ",
			"\\mathbf{E}": "Applied electric field",
			"e" : "Charge of an electron"
		},
		"keywords": ["conduction","semiconductor"],
		"tags": ["Electrical engineering", "Semiconductors"],
		"href":"https://en.wikipedia.org/wiki/Electric_current",
		"contributed_by": ""
	},
	{
		"name": "Shockley Diode equation",
		"latex": "$$ i=I_{l}\\left[e^{x}-1\\right] \\quad ; \\quad x=\\frac{e V}{k T} $$",
		"description": "A semiconductor diode conducts forward cunent with a small forward voltage drop across the device, simulating a closed switch. The relationship between the forward current and forward voltage is a good approximation given by the Shockley diode equation.",
		"definition": {
			"i" : "Forward current",
			"V"  : "Forward Voltage",
			"I_l":"Leakage current",
			"k":"Boltzmann constant ",
			"T": "Diode Temperature",
			"e" : "Charge of an electron"
		},
		"keywords": ["diode","forward current", "forward voltage","Shockley"],
		"tags": ["Electrical engineering", "Semiconductors"],
		"href":"https://en.wikipedia.org/wiki/Shockley_diode",
		"contributed_by": ""
	},
	{
		"name": "Drain current in saturation region: JFET",
		"latex": "$$ I_{\\mathrm{DS}}=I_{\\mathrm{DSS}}\\left(1-\\frac{V_{\\mathrm{GS}}}{V_{\\mathrm{P}}}\\right)^{2} $$",
		"description": "In a junction field effect transistor (JFET), the width of the depletion layers controls the conductance. For the JFET, the drain current in the constant-current region is",
		"definition": {
			"I_{\\mathrm{DS}}" : "Drain Current",
			"I_{\\mathrm{DSS}}"  : "Saturation current (0V gate-source)",
			"V_{GS}":"Gate-source voltage",
			"V_p":"Pinch-off voltage"
		},
		"keywords": ["FET","transistor", "drain current","field effect transistor"],
		"tags": ["Electrical engineering", "Semiconductors"],
		"href":"https://en.wikipedia.org/wiki/JFET#Constant_current_region",
		"contributed_by": ""
	},
	{
		"name": "Drain current: MOSFET",
		"latex": "$$ I_{\\mathrm{DS}}=K\\left(V_{\\mathrm{GS}} -{V_{\\mathrm{T}}}\\right)^{2} $$",
		"description": "A semiconductor diode conducts forward cunent with a small forward voltage drop across the device, simulating a closed switch. The relationship between the forward current and forward voltage is a good approximation given by the Shockley diode equation.",
		"definition": {
			"I_{\\mathrm{DS}}" : "Drain Current",
			"K"  : "Device parameter",
			"V_{GS}":"Gate-source voltage",
			"V_T":"Threshold voltage"
		},
		"keywords": ["FET","transistor", "drain current","field effect transistor", " Metal oxide semiconductor"],
		"tags": ["Electrical engineering", "Semiconductors"],
		"href":"https://en.wikipedia.org/wiki/MOSFET",
		"contributed_by": ""
	},
	{
		"name": "Collector Current: BJT",
		"latex": "$$ I_{\\mathrm{C}}= - \\alpha i_E \\, + \\, I_{CBO} \\quad ; \\quad \\alpha \\approx 1 $$",
		"description": "A bipolar junction transistor consists of two pn junctions in close proximity, normally, the emitter junction is forward biased, the collector reverse biased. In common-base operation, the collector current is given by the formula above.",
		"definition": {
			"I_{\\mathrm{C}}" : "Collector current",
			"I_{\\mathrm{c}}" : "Emitter current",
			"I_{CBO}"  : "Collector cut-off current",
			"\\alpha":"Forward current-transfer ratio",
		},
		"keywords": ["transistor", "drain current","bipolar junction transistor"],
		"tags": ["Electrical engineering", "Semiconductors"],
		"href":"https://en.wikipedia.org/wiki/MOSFET",
		"contributed_by": ""
	},
	{
		"name": "Channel Capacity: Shannon-Hartley Theorem",
		"latex": "$$ C =  B log_2 \\left(1+ \\frac{S}{N}\\right) $$",
		"description": "The limiting rate of information transmission through a channel is called the channel capacity.",
		"definition": {
			"C" : "Capacity (bits/sec) ",
			"B" : "Bandwidth (Hz)",
			"S/N"  : "Signal-to-noise ratio",
			"\\alpha":"Forward current-transfer ratio",
		},
		"keywords": ["information", "capacity graph","communication"],
		"tags": ["Electrical engineering", "Information Theory"],
		"href":"https://en.wikipedia.org/wiki/MOSFET",
		"contributed_by": ""
	},
	{
		"name": "Entropy (Information Theory)",
		"latex": "$$ H=\\sum_{i=1}^{n} P_{i} \\log _{2} \\frac{1}{P_{i}}$$",
		"description": "In information theory, the entropy of a random variable is the average level of information, surprise, or uncertainty inherent in the variable's possible outcomes.",
		"definition": {
			"P_i" : "Probability of outcome i "
		},
		"keywords": ["information", "capacity graph","communication", "average information"],
		"tags": ["Electrical engineering", "Information Theory"],
		"href":"https://en.wikipedia.org/wiki/MOSFET",
		"contributed_by": ""
	},
	{
		"name": "Mass flow rate",
		"latex": "$$ \\dot{m} = \\rho V A$$",
		"description": "Mass flow rate is the mass of a substance which passes per unit of time",
		"definition": {
			"\\dot{m}" : "Mass flow rate ",
			"\\rho" : "Density",
			"V" : "Volume",
			"A" : "Cross-section area"
		},
		"keywords": ["fluid mechanics", "rocket propulsion","flow", "flow rate"],
		"tags": ["Mechanical engineering", "Propulsion", "Thermodynamics", "Fluid Mechanics"],
		"href":"https://en.wikipedia.org/wiki/Mass_flow_rate",
		"contributed_by": ""
	},
	{
		"name": "Chocked Mass flow rate: De Laval Nozzle",
		"latex": "$$ \\dot{m}=\\sqrt{\\gamma}\\left\\{\\frac{2}{\\gamma+1}\\right\\}^{(\\gamma+1) /[2(\\gamma-1)]} \\frac{p_{c} A_{t}}{\\sqrt{\\left(R T_{c} / W\\right)}}$$",
		"description": "In convergent-divergent (de Laval) nozzles the velocity continues to increase downstream from the throat but the nozzle is choked—that is, the mass flow is simply determined by throat conditions, independent of the exit flow condition. The choked mass flow rate can be expressed as a function of combustion chamber conditions and throat area.",
		"definition": {
			"\\dot{m}" : "Mass flow rate ",
			"\\gamma" : "Specific heat ratio",
			"A_t" : "Area at Throat",
			"p_c" : "Chamber pressure",
			"T_c" : "Chamber temperature",
			"R" : "Universal gas constant",
			"W": "Molecular weight"
		},
		"keywords": ["fluid mechanics", "rocket propulsion","flow", "flow rate"],
		"tags": ["Mechanical engineering", "Propulsion", "Thermodynamics", "Fluid Mechanics"],
		"href":"https://en.wikipedia.org/wiki/Mass_flow_rate",
		"contributed_by": ""
	},
	{
		"name": "Characteristic Velocity",
		"latex": "$$ c^{*}=\\sqrt{\\left(R T / W\\right)} /\\left\\{\\sqrt{\\gamma}\\left[\\frac{2}{\\gamma+1}\\right]^{(\\gamma+1) /[2(\\gamma-1)]}\\right\\}$$",
		"description": "In convergent-divergent (de Laval) nozzles the velocity continues to increase downstream from the throat but the nozzle is choked—that is, the mass flow is simply determined by throat conditions, independent of the exit flow condition. The choked mass flow rate can be expressed as a function of combustion chamber conditions and throat area. For this case, the characteristic velocity is given by the above formula",
		"definition": {
			"\\gamma" : "Specific heat ratio",
			"A_t" : "Area at Throat",
			"p_c" : "Chamber pressure",
			"T_c" : "Chamber temperature",
			"R" : "Universal gas constant",
			"W": "Molecular weight"
		},
		"keywords": ["fluid mechanics", "rocket propulsion","flow", "flow rate"],
		"tags": ["Aerospace engineering", "Propulsion", "Thermodynamics", "Fluid Mechanics"],
		"href":"https://en.wikipedia.org/wiki/Characteristic_velocity",
		"contributed_by": ""
	},
	{
		"name": "Exhaust Velocity",
		"latex": "$$ V_{e}=\\sqrt{\\left\\{\\frac{2 \\gamma R_{0} T_{c}}{(\\gamma-1) W}\\left[1-\\left(\\frac{p_{e}}{p_{c}}\\right)^{(\\gamma-1) / \\gamma}\\right]\\right\\}}$$",
		"description": "In convergent-divergent (de Laval) nozzles the velocity continues to increase downstream from the throat but the nozzle is choked—that is, the mass flow is simply determined by throat conditions, independent of the exit flow condition. The choked mass flow rate can be expressed as a function of combustion chamber conditions and throat area. For this case, the exhaust velocity is given by the above formula",
		"definition": {
			"\\gamma" : "Specific heat ratio",
			"A_t" : "Area at Throat",
			"p_c" : "Chamber pressure",
			"p_e" : "Exhaust Pressure",
			"T_c" : "Chamber temperature",
			"R" : "Universal gas constant",
			"W": "Molecular weight"
		},
		"keywords": ["fluid mechanics", "rocket propulsion","flow", "flow rate"],
		"tags": ["Aerospace engineering", "Propulsion", "Thermodynamics", "Fluid Mechanics"],
		"href":"http://seitzman.gatech.edu/classes/ae4451/thrust_coefficient.pdf",
		"contributed_by": ""
	},
	{
		"name": "Characteristic Thrust Coefficient (Ideal)",
		"latex": "$$ C_{F}^{0}=\\sqrt{\\left\\{\\left[\\gamma\\left(\\frac{2}{\\gamma+1}\\right)^{(\\gamma+1) /(\\gamma-1)}\\right] \\frac{2 \\gamma}{\\gamma-1}\\left[1-\\left(\\frac{p_{e}}{p_{c}}\\right)^{(\\gamma-1) / \\gamma}\\right]\\right\\}}$$",
		"description": "In convergent-divergent (de Laval) nozzles the velocity continues to increase downstream from the throat but the nozzle is choked—that is, the mass flow is simply determined by throat conditions, independent of the exit flow condition. The choked mass flow rate can be expressed as a function of combustion chamber conditions and throat area. For this case, the characteristic thrust coefficient is given by the above formula",
		"definition": {
			"\\gamma" : "Specific heat ratio",
			"p_c" : "Chamber pressure",
			"p_e" : "Exhaust Pressure",
		},
		"keywords": ["fluid mechanics", "rocket propulsion","flow", "flow rate"],
		"tags": ["Aerospace engineering", "Propulsion", "Thermodynamics", "Fluid Mechanics"],
		"href":"http://seitzman.gatech.edu/classes/ae4451/thrust_coefficient.pdf",
		"contributed_by": ""
	},
	{
		"name": "Characteristic Thrust Coefficient (Non-ideal)",
		"latex": "$$ \\frac{C_{F}}{\\left\\{C_{F}^{0}\\right\\}_{\\max }}=\\frac{C_{F}^{0}}{\\left\\{C_{F}^{0}\\right\\}_{\\max }}+\\frac{\\gamma\\left(\\frac{2}{(\\gamma+1)}\\right)^{(\\gamma+1) /(\\gamma-1)}\\left(\\frac{p_{c}}{p_{e}}\\right)^{\\frac{1}{\\gamma}}}{C_{F}^{0}\\left\\{C_{F}^{0}\\right\\}_{\\max }}\\left(\\frac{p_{e}}{p_{c}}-\\frac{p_{a}}{p_{c}}\\right) $$",
		"description": "In convergent-divergent (de Laval) nozzles the velocity continues to increase downstream from the throat but the nozzle is choked—that is, the mass flow is simply determined by throat conditions, independent of the exit flow condition. The choked mass flow rate can be expressed as a function of combustion chamber conditions and throat area. For this case, the characteristic thrust coefficient is given by the above formula",
		"definition": {
			"\\gamma" : "Specific heat ratio",
			"p_c" : "Chamber pressure",
			"p_e" : "Exhaust Pressure",
			"p_a" : "Ambient pressure",
			"C_F^0": "Ideal thrust coefficient",
			"C_F": "Non-ideal thrust coefficient"
		},
		"keywords": ["fluid mechanics", "rocket propulsion","flow", "flow rate"],
		"tags": ["Aerospace engineering", "Propulsion", "Thermodynamics", "Fluid Mechanics"],
		"href":"http://seitzman.gatech.edu/classes/ae4451/thrust_coefficient.pdf",
		"contributed_by": ""
	},
	{
		"name": "Exit-to-Throat area ratio",
		"latex": "$$ \\frac{A_{e}}{A_{t}}=\\frac{\\rho_{t} V_{t}}{\\rho_{e} V_{e}}=\\gamma\\left(\\frac{2}{\\gamma+1}\\right)^{(\\gamma+1) /(\\gamma-1)}\\left(\\frac{p_{c}}{p_{e}}\\right)^{1 / \\gamma} / C_{F}^{0}$$",
		"description": "In convergent-divergent (de Laval) nozzles the velocity continues to increase downstream from the throat but the nozzle is choked—that is, the mass flow is simply determined by throat conditions, independent of the exit flow condition. The choked mass flow rate can be expressed as a function of combustion chamber conditions and throat area. For this case, the exit-to-throat area ratio is given by the above formula",
		"definition": {
			"\\gamma" : "Specific heat ratio",
			"A_t" : "Area at Throat",
			"p_c" : "Chamber pressure",
			"p_t" : "Throat Pressure",
			"T_c" : "Chamber temperature",
			"V_t" : "Critical throat velocity",
			"V_e": "Exhaust velocity",
			"C_F^0": "Ideal thrust coefficient"
		},
		"keywords": ["fluid mechanics", "rocket propulsion","flow", "flow rate"],
		"tags": ["Aerospace engineering", "Propulsion", "Thermodynamics", "Fluid Mechanics"],
		"href":"http://seitzman.gatech.edu/classes/ae4451/thrust_coefficient.pdf",
		"contributed_by": ""
	},
	{
		"name": "Exit-to-Throat area ratio",
		"latex": "$$ \\frac{A_{e}}{A_{t}}=\\frac{\\rho_{t} V_{t}}{\\rho_{e} V_{e}}=\\gamma\\left(\\frac{2}{\\gamma+1}\\right)^{(\\gamma+1) /(\\gamma-1)}\\left(\\frac{p_{c}}{p_{e}}\\right)^{1 / \\gamma} / C_{F}^{0}$$",
		"description": "In convergent-divergent (de Laval) nozzles the velocity continues to increase downstream from the throat but the nozzle is choked—that is, the mass flow is simply determined by throat conditions, independent of the exit flow condition. The choked mass flow rate can be expressed as a function of combustion chamber conditions and throat area. For this case, the exit-to-throat area ratio is given by the above formula",
		"definition": {
			"\\gamma" : "Specific heat ratio",
			"A_t" : "Area at Throat",
			"p_c" : "Chamber pressure",
			"p_t" : "Throat Pressure",
			"T_c" : "Chamber temperature",
			"V_t" : "Critical throat velocity",
			"V_e": "Exhaust velocity",
			"C_F^0": "Ideal thrust coefficient"
		},
		"keywords": ["fluid mechanics", "rocket propulsion","flow", "flow rate"],
		"tags": ["Aerospace engineering", "Propulsion", "Thermodynamics", "Fluid Mechanics"],
		"href":"http://seitzman.gatech.edu/classes/ae4451/thrust_coefficient.pdf",
		"contributed_by": ""
	},
	{
		"name": "Weber number",
		"latex": "$$ W_e \\, = \\, \\frac{\\rho V^2 L}{\\sigma}$$",
		"description": "Ratio of inertia and surface tension forces in a liquid",
		"definition": {
			"\\rho" : "Density",
			"L": "Characteristic length",
			"V" : "Velocity",
			"\\sigma": "Surface tension"
		},
		"keywords": ["fluid mechanics", "rocket propulsion","flow", "flow rate"],
		"tags": ["Aerospace engineering", "Propulsion", "Thermodynamics", "Fluid Mechanics"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Bond number",
		"latex": "$$ B_0 \\, = \\, \\frac{\\rho L^2 g}{\\sigma}$$",
		"description": "Ratio of gravity and surface tension forces in a liquid",
		"definition": {
			"\\rho" : "Density",
			"L": "Characteristic length",
			"g" : "Gravitational acceleration",
			"\\sigma": "Surface tension"
		},
		"keywords": ["fluid mechanics", "rocket propulsion","flow", "flow rate"],
		"tags": ["Aerospace engineering", "Propulsion", "Thermodynamics", "Fluid Mechanics"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Gravity gradient (external) torque",
		"latex": "$$ \\begin{array}{l} T_{x}=\\left(3 \\mu / 2 r^{3}\\right)\\left(I_{z z}-I_{y y}\\right) \\sin 2 \\phi \\cos ^{2} \\theta \\\\ T_{y}=\\left(3 \\mu / 2 r^{3}\\right)\\left(I_{z z}-I_{x x}\\right) \\sin 2 \\theta \\cos \\phi \\\\ T_{z}=\\left(3 \\mu / 2 r^{3}\\right)\\left(I_{x x}-I_{y y}\\right) \\sin 2 \\theta \\sin \\phi \\end{array}$$",
		"description": "This source of torque occurs because in a gravitational field that gets weaker with increase in height, a body will only be in stable equilibrium if its axis of minimum inertia is aligned with the local vertical.",
		"definition": {
			"T" : "Torque",
			"\\mu": "Standard gravitational parameter",
			"r" : "Instantaneous radius(Earth-relative)",
			"I_{xx},\\,I_{yy},\\,I_{zz}": "Principal moments of Inertia",
			"\\phi" : "Azimuth",
			"\\theta": "Declination"
		},
		"keywords": ["disturbance torque", "gravity","orbit", "spacecraft attitude"],
		"tags": ["Aerospace engineering", "Orbital mechanics", "Dynamics"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Aerodynamic Torque (spacecraft disturbance)",
		"latex": "$$ \\mathbf{T}_{\\mathrm{aero}}=\\sum_{i=1}^{n} \\mathbf{r}_{i} \\times \\mathbf{F}_{\\mathrm{aero}, i}, \\quad \\mathbf{F}_{\\mathrm{aero}, i}=\\frac{1}{2} \\rho V_{a}^{2} C_{D}\\left(\\mathbf{\\hat { n }}_{i} . \\hat{\\mathbf{V}}_{\\mathrm{a}}\\right) A_{i}\\left(-\\hat{\\mathbf{V}}_{\\mathrm{a}}\\right)$$",
		"description": "Aerodynamic torques are dominated by the drag force, which is dependent on frontal area. Their total moment about the centre-of-mass C may be assessed by considering the projection in the direction of travel.",
		"definition": {
			"\\mathbf{T}_{\\mathrm{aero}}" : "Aerodynamic Torque",
			"\\mu": "Standard gravitational parameter",
			"A_i": "Area of i^{th} element on the body",
			"C_D": "Drag Coefficient",
			"\\hat{\\mathbf{n}_i}" : "Unit normal vector for i^{th} element"
		},
		"keywords": ["disturbance torque", "aerodynamic","drag", "spacecraft attitude"],
		"tags": ["Aerospace engineering", "Orbital mechanics", "Attitude Dynamics"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Solar Radiation Pressure (spacecraft disturbance)",
		"latex": "$$ \\begin{align}\\mathbf{T}_{\\mathrm{SRP}}=\\sum_{i=1}^{n} \\mathbf{r}_{i} \\times \\mathbf{F}_{\\mathrm{SRP}, i}, \\quad& \\mathbf{F}_{\\mathrm{SRP}, i}=a_{i} \\hat{\\mathbf{s}}+b_{i} \\hat{\\mathbf{n}}_{i} \\\\ a_{i}=-P A_{i} \\cos \\theta_{i}\\left(1-f_{\\mathrm{s}, i}\\right), \\quad & b_{i}=-2 P A_{i} \\cos \\theta_{i}\\left(f_{\\mathrm{s}, i} \\cos \\theta_{i}+\\frac{1}{3} f_{\\mathrm{d}, i}\\right) \\end{align}$$",
		"description": "Solar radiation produces a force on a surface, which depends upon its distance from the Sun; it is independent to first order of the height above the Earth. Large flat surfaces with a significant moment arm about the centre-of-mass, such as solar arrays, may produce a significant torque. Since light carries momentum, when it is reflected at a surface this represents an exchange of momentum with the surface, which gives rise to the SRP. The force exerted on the surface can be calculated by a vector difference between the incoming and outgoing momentum fluxes.",
		"definition": {
			"\\mathbf{T}_{\\mathrm{SRP}}" : "Solar Radiation Pressure Torque",
			"\\hat{\\mathbf{s}}": "Unit vector towards sun",
			"\\theta": "Angle of incidence of solar radiation",
			"f_s, f_d": "Specular and diffuse reflection coefficients",
			"\\hat{\\mathbf{n}_i}" : "Unit normal vector for i^{th} element"
		},
		"keywords": ["disturbance torque", "aerodynamic","drag", "spacecraft attitude"],
		"tags": ["Aerospace engineering", "Orbital mechanics", "Attitude Dynamics"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Terminal voltage: Ideal fuel cell",
		"latex": "$$ E_R \\; = \\; \\frac{-\\Delta G}{nF} $$",
		"description": "A semiconductor diode conducts forward cunent with a small forward voltage drop across the device, simulating a closed switch. The relationship between the forward current and forward voltage is a good approximation given by the Shockley diode equation.",
		"definition": {
			"\\Delta G" : "Gibbs Free Energy",
			"n"  : "Number of electrons transferred",
			"F":"Faraday constant (9.65+E4 C/mol)",
		},
		"keywords": ["Voltage","Fuel cell", "EPS","Power subsystem"],
		"tags": ["Electrical engineering", "Energy"],
		"href":"https://en.wikipedia.org/wiki/Fuel_cell",
		"contributed_by": ""
	},
	{
		"name": "RTG Power availability over lifetime",
		"latex": "$$ P_{t}=P_{0} \\exp \\left(\\frac{-0.693}{\\tau_{1 / 2}} t\\right) $$",
		"description": "Radioisotope thermoelectric generators (RTG) are used for deep space missions. The heat source used in space systems is derived from the spontaneous decay of a radioactive material. As this decays, it emits high-energy particles that can lose part of their energy in heating absorbing materials.",
		"definition": {
			"P_t" : "Power at time t",
			"P_0"  : "Initial power at time \\(t_0\\)",
			"\\tau":"Radioactive decay half-life",
		},
		"keywords": ["Radioisotope thermoelectric generators","nuclear", "EPS","Power subsystem"],
		"tags": ["Electrical engineering", "Energy", "spacecraft engineering"],
		"href":"https://en.wikipedia.org/wiki/Fuel_cell",
		"contributed_by": ""
	},
	{
		"name": "Total Solar Energy Requirement",
		"latex": "$$\\varepsilon_{\\text {array }}=P_{\\text {array }} \\tau_{\\text {sun }}=\\frac{1}{\\eta_{\\text {sun }}}\\left(\\sum_{i=1}^{k} P_{i} t_{i}\\right)+\\frac{1}{\\eta_{\\text {ecl }}}\\left(\\sum_{i=k+1}^{n} P_{i} t_{i}\\right)$$",
		"description": "Energy requirement for spacecraft power system from a solar panel. First order approximation. The battery charge requirement during sunlight is explicitly excluded from this profile,",
		"definition": {
			"P_i" : "Spacecraft power profile for i\\(^{th}\\) instant",
			"t_i"  : "time instant",
			"\\eta_{sun}":"Efficiency factor: array to loads (\\(approx\\)0.8)",
			"\\eta_{ecl}":"Efficiency factor: battery to loads (\\(approx\\)0.6)",
		},
		"keywords": ["Solar panel","sizing", "EPS","Power subsystem", "Solar array"],
		"tags": ["Electrical engineering", "Energy", "spacecraft engineering"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "solar radiation intensity",
		"latex": "$$J_{s}=\\frac{P}{4 \\pi d^{2}}$$",
		"description": "The solar radiation intensity outside the Earth’s atmosphere and at the Earth’s average distance from the Sun (1 AU) is called the solar constant and is about 1371 ±5 W/m2.",
		"definition": {
			"J_s": "Solar radiation intensity",
			"P": "Total solar power output (3.856 × 10\\(^{26}\\) W",
			"d": "distance from the sun"
		},
		"keywords": ["Solar panel","sizing", "Thermal","Solar array"],
		"tags": ["Spacecraft engineering", "Energy", "Thermal subsystem"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Thermal Equilibrium Temperature (Solar, no dissipation)",
		"latex": "$$T^{4}=\\frac{A_{\\alpha}}{A_{\\varepsilon}} \\frac{J_{\\text {incident }}}{\\sigma}\\left(\\frac{\\alpha}{\\varepsilon}\\right)$$",
		"description": "Equilibrium temperature for spacecraft without internal dissipation with an equivalent absorptive surface and an equivalend emissive surface.",
		"definition": {
			"A_{\\alpha}": "Area of absorption",
			"A_{\\epsilon}": "Area of emission",
			"\\alpha": "Material absorptivity",
			"\\epsilon": "Material emissivity",
			"J_{{incident}}": "Incident thermal radiation",
			"\\sigma": "Stefan-boltzmann constant"
		},
		"keywords": ["Solar panel","sizing", "Thermal","Solar array", "Temperature"],
		"tags": ["Spacecraft engineering", "Energy", "Thermal subsystem"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Thermal Equilibrium Temperature (Isothermal spacecraft, no eclipse)",
		"latex": "$$T^{4}=\\frac{A_{\\text {planetary }} J_{p}}{A_{\\text {surface }} \\sigma}+\\frac{Q}{A_{\\text {surface }} \\sigma \\varepsilon}+\\frac{\\left(A_{\\text {solar }} J_{s}+A_{\\text {albedo }} J_{a}\\right)}{A_{\\text {surface }} \\sigma}\\left(\\frac{\\alpha}{\\varepsilon}\\right)$$",
		"description": "Equilibrium temperature for a typical spacecraft in LEO. considering Albedo, solar and planetary sources, internal heat dissipation and surface radiated heat, the equilibrium temperature is given by the above formula. ",
		"definition": {
			"A": "Effective area",
			"\\alpha": "Material absorptivity",
			"\\epsilon": "Material emissivity",
			"J_{{incident}}": "Incident thermal radiation",
		},
		"keywords": ["Solar panel","sizing", "Thermal","Solar array", "Temperature"],
		"tags": ["Spacecraft engineering", "Energy", "Thermal subsystem"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Conductive heat flow rate",
		"latex": "$$Q_{\\mathrm{c}}=\\frac{\\lambda A}{l} \\Delta T$$",
		"description": " ",
		"definition": {
			"Q_c": "Conductive heat flow rate",
			"\\lambda": "Material conductivity",
			"l": "Conduction path length",
			"A": "Cross-section area",
			"\\Delta T": "Temperature difference"
		},
		"keywords": ["Thermal mathematical model","thermal subsystem", "conduction","Solar array", "Temperature"],
		"tags": ["Spacecraft engineering", "Energy", "Thermal subsystem"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Conductive Heat Transfer",
		"latex": "$$Q_{c_{i j}}=h_{i j}\\left(T_{i}-T_{j}\\right)$$",
		"description": " ",
		"definition": {
			"ij": "nodes",
			"$Q_{c_{i j}}": "Conductance between nodes",
			"T": "Temperature",
			"h": "Conductance (\\(\\frac{l}{\\lambda A}\\))"
		},
		"keywords": ["Thermal mathematical model","thermal subsystem", "conduction","Solar array", "Temperature"],
		"tags": ["Spacecraft engineering", "Energy", "Thermal subsystem"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Radiative Heat Transfer",
		"latex": "$$Q_{r_{i j}}=A_{i} F_{i j} \\varepsilon_{i j} \\sigma\\left(T_{i}^{4}-T_{j}^{4}\\right)$$",
		"description": "Radiative heat exchange between two surfaces is determined by three important parameters—the surface temperatures, the radiative view factors and the surface properties. For diffuse surfaces, the amount of radiation leaving a surface i and absorbed by a surface j is given by the above formula",
		"definition": {
			"ij": "Radiative nodes",
			"A_i": "Radiative surface area",
			"\\epsilon": "Emissivity",
			"T": "Temperature",
			"\\sigma": "Stefan-boltzmann constant",
			"F_{ij}": "View factors between surface i and j"
		},
		"keywords": ["Thermal mathematical model","thermal subsystem", "conduction","Solar array", "Temperature"],
		"tags": ["Spacecraft engineering", "Energy", "Thermal subsystem"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Radiative View factor",
		"latex": "$$ F_{12}=\\frac{1}{A_{1}} \\iint_{A_{1}} \\int_{A_{2}} \\frac{\\cos \\phi_{1} \\cos \\phi_{2}}{\\pi s^{2}} \\mathrm{d} A_{1} \\mathrm{d} A_{2} $$",
		"description": "Radiative heat exchange between two surfaces is determined by three important parameters—the surface temperatures, the radiative view factors and the surface properties. The radiative view factors is given by the above formula",
		"definition": {
			"A": "Radiative surface area",
			"dA": "Surface area element",
			"\\phi": "View angle from normal",
			"s": "Separation distance between two surfaces",
		},
		"keywords": ["Thermal mathematical model","thermal subsystem", "conduction","Radiation", "Temperature"],
		"tags": ["Spacecraft engineering", "Energy", "Thermal subsystem"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Maximum heat transport (heat pipes)",
		"latex": "$$ Q_{\\max } \\approx \\frac{A_{\\mathrm{wick}}}{l_{\\mathrm{eff}}} \\frac{\\phi \\rho H_{v}}{\\eta}\\left(\\frac{2 \\sigma}{r_{0}}-\\rho g l_{\\mathrm{eff}} \\sin \\alpha\\right) $$",
		"description": "Two-phase heat transport systems, such as heat pipes, loop heat pipes (LHPs) and capillary-pumped loops (CPLs), are devices which transfer heat in the form of the latent heat of vaporization, using a volatile working fluid that is circulated by capillary action in a porous wick structure. Assuming that the working fluid perfectly wets the wick material (i.e. contact angle is zero), the maximum capillary pressure that can be generated by the wick is given by the above formula.",
		"definition": {
			"\\sigma": "Surface tension",
			"r_0": "Effective pore radius",
			"H_v": "Latent heat of vaporization",
			"A_{wick}": " Cross-section area of wick",
			"\\rho": "Density of liquid phase",
			"\\eta": "dynamic viscosity of the liquid phase",
			"\\phi": "Permeability of the wick structure",
			"l_{eff}": "Effective length of the heat pipe",
			"\\alpha": "Inclination/orientation angle",
			"g": "Gravitational acceleration"
		},
		"keywords": ["Thermal mathematical model","thermal subsystem", "conduction","Heat pipes", "Temperature"],
		"tags": ["Spacecraft engineering", "Energy", "Thermal subsystem"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Effective Conductance (heat pipes)",
		"latex": "$$ \\frac{1}{h_{eff}} =  \\frac{1}{h_{evap}} +  \\frac{1}{h_{cond}}$$",
		"description": "Two-phase heat transport systems, such as heat pipes, loop heat pipes (LHPs) and capillary-pumped loops (CPLs), are devices which transfer heat in the form of the latent heat of vaporization, using a volatile working fluid that is circulated by capillary action in a porous wick structure. Assuming that the working fluid perfectly wets the wick material (i.e. contact angle is zero), the maximum capillary pressure that can be generated by the wick is given by the above formula.",
		"definition": {
			"{h_{eff}" : "Effective conductance",
			"{h_{evap}" :"Radial conductance (Evaporator)",
			"{h_{cond}" :"Radial conductance (Condenser)"
		},
		"keywords": ["Thermal mathematical model","thermal subsystem", "conduction","Heat pipes", "Temperature"],
		"tags": ["Spacecraft engineering", "Energy", "Thermal subsystem"],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Carson Bandwidth",
		"latex": "$$ B_C = 2( \\Delta f + f_m)$$",
		"description": "the bandwidth containing about 98% of the power.",
		"definition": {
			"\\Delta f" : "Peak frequency deviation",
			"f_m" :"Highest frequency in baseband"
		},
		"keywords": ["Telecommunication","Telemetry", "TTC","Spectrum", "Bandwidth"],
		"tags": ["Spacecraft engineering", "Communications",],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Power-density spectrum",
		"latex": "$$ S(f)=V^{2} T(\\sin \\pi f T)^{2} /(\\pi f T)^{2}$$",
		"description": "For Phase-shift keying the spectrum depends both on the type of modulation (PRK, QPSK etc.) and on the encoding procedure used in producing the bit stream. In general for random binary signal, power-density spectrum may be defined that is the power per Hz of bandwidth at the frequency f ",
		"definition": {
			"V" : "Signal voltage",
			"T" :"Time-length of one bit",
			"f" : "frequency of the signal"
		},
		"keywords": ["Telecommunication","Telemetry", "TTC","phase-shift keying", "Bandwidth", "PRK QPSK"],
		"tags": ["Spacecraft engineering", "Communications",],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Total power in Bandwidth",
		"latex": "$$ P = kTB $$",
		"description": "Total power in the bandwidth for constant power spectral density",
		"definition": {
			"k" : "Boltzmann constant",
			"T" :"Temperature",
			"B" : "Bandwidth",
		},
		"keywords": ["Telecommunication","Telemetry", "TTC","phase-shift keying", "Bandwidth", "Power"],
		"tags": ["Spacecraft engineering", "Communications",],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Atmospheric refraction: Signal shift ",
		"latex": "$$ R=\\frac{0.02}{\\tan [e+0.14+7.32 /(e+4)]} \\text { degrees } $$",
		"description": "For Phase-shift keying the spectrum depends both on the type of modulation (PRK, QPSK etc.) and on the encoding procedure used in producing the bit stream. In general for random binary signal, power-density spectrum may be defined that is the power per Hz of bandwidth at the frequency f ",
		"definition": {
			"e" : "elevation"
		},
		"keywords": ["Telecommunication","Telemetry", "TTC","phase-shift keying", "Bandwidth", "Power"],
		"tags": ["Spacecraft engineering", "Communications",],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Directive gain (Uniform illumination) ",
		"latex": "$$ G = \\frac{4\\pi A}{\\lambda^2} $$",
		"description": "Directive gain is the ratio of actual power flux density to the power density from an isotropic antenna. For a uniformly illuminated antenna with physical area A, the directive gain at the centre of the main beam is given by ",
		"definition": {
			"A" : "Antenna area",
			"\\lambda": "Wavelength"
		},
		"keywords": ["Telecommunication","Telemetry", "TTC","phase-shift keying", "Bandwidth", "Power"],
		"tags": ["Spacecraft engineering", "Communications",],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Effective aperture of an Antenna ",
		"latex": "$$ A_e = \\frac{\\lambda^2 G}{4\\pi} $$",
		"description": "Directive gain is the ratio of actual power flux density to the power density from an isotropic antenna. For a uniformly illuminated antenna with physical area A, the directive gain at the centre of the main beam is given by ",
		"definition": {
			"A_e" : "Effective aperture",
			"G": "Directive gain at the beam center"
		},
		"keywords": ["Telecommunication","Telemetry", "TTC","phase-shift keying", "Bandwidth", "Power"],
		"tags": ["Spacecraft engineering", "Communications",],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Equivalent Isotropic Radiated Power (EIRP)",
		"latex": "$$ A_e = \\frac{\\lambda^2 G}{4\\pi} $$",
		"description": "EIRP = P_T G_T ",
		"definition": {
			"P_T" : "Output power",
			"G_T": "Antenna gain"
		},
		"keywords": ["Telecommunication","Telemetry", "TTC","Link budget", "Bandwidth", "Power"],
		"tags": ["Spacecraft engineering", "Communications",],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Flux density at Reciever: Isotropic radiator",
		"latex": "$$ S = \\frac{P_T G_T}{4 \\pi r^2 L_A}$$",
		"description": "If atmospheric attenuation results in power loss by a factor LA, then the flux density at the receiver is given by the above formula",
		"definition": {
			"L_A" : "Attenuation loss factor",
			"P_T" : "Output power",
			"G_T": "Antenna gain",
			"r": "Distance from source"
		},
		"keywords": ["Telecommunication","Telemetry", "TTC","Link budget", "Bandwidth", "Power"],
		"tags": ["Spacecraft engineering", "Communications",],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Signal power at receiver input",
		"latex": "$$ C = P_T G_T G_R \\left( \\frac{\\lambda}{4 \\pi r^2} \\right)^2 \\frac{1}{L_A}$$",
		"description": "Isotropic source with atmospheric attentuation loss. ",
		"definition": {
			"L_A" : "Attenuation loss factor",
			"P_T" : "Output power",
			"G_T": "Antenna gain",
			"G_R": "Receiver gain",
			"r": "Distance from source"
		},
		"keywords": ["Telecommunication","Telemetry", "TTC","Link budget", "Bandwidth", "Power"],
		"tags": ["Spacecraft engineering", "Communications",],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	},
	{
		"name": "Signal-to-noise-power-density ratio (C/N0)",
		"latex": "$$ C / N_{0}=P_{\\mathrm{T}} G_{\\mathrm{T}}(\\lambda / 4 \\pi r)^{2}\\left(1 / L_{\\mathrm{A}}\\right)\\left(G_{\\mathrm{R}} / T_{\\mathrm{sys}}\\right)(1 / k)$$",
		"description": "Telecommunications link budget equation. ",
		"definition": {
			"L_A" : "Attenuation loss factor",
			"P_T" : "Output power",
			"G_T": "Antenna gain",
			"G_R": "Receiver gain",
			"r": "Distance from source",
			"T_sys": "System temperature",
			"k": "Boltzmann constant"
		},
		"keywords": ["Telecommunication","Telemetry", "TTC","Link budget equation", "Bandwidth", "Power"],
		"tags": ["Spacecraft engineering", "Communications",],
		"href":"https://books.google.nl/books?hl=en&lr=&id=cCYP0rVR_IEC&oi=fnd&pg=PT10&dq=spacecraft+systems+engineering+&ots=IHezW9yNdP&sig=Y1_W_DJlIkzPuzqKhpIdDdIZr0U&redir_esc=y#v=onepage&q=spacecraft%20systems%20engineering&f=false",
		"contributed_by": ""
	}

]


var options = {
	shouldSort: true,
	matchAllTokens: true,
	findAllMatches: true,
	threshold: 0.1,
	location: 5,
	distance: 50,
	maxPatternLength: 32,
	minMatchCharLength: 4,
	includeScore: true,
	keys: ["name", "keywords"]
};

var showMore = 5
var showMoreindices=[0, showMore-1]
var resultJSON = {}
var delayedSearch;
let dataset;
let fuse;

searchEle.addEventListener("input", event => {
	if (delayedSearch) {
		clearTimeout(delayedSearch);
	}
	delayedSearch = setTimeout(doSearch(dataset,fuse), 300);
});


/* MODIFY HERE: LINK TO THE HOSTED JSON*/
fetch('https://api.github.com/orgs/nodejs')
	.then(response => response.json())
	.then(function(json){
		dataset = raw_dataset;
		dataset = dataset.reverse();
		for (i=0; i<dataset.length; i++){
			dataset[i].id = i;
		}
		fuse = new Fuse(dataset, options);
		doSearch(dataset,fuse);
	});

