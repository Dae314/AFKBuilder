import { get, writable } from 'svelte/store';
import HeroData from './HeroData.js';
import TestComps from './TestComps.js'

let AppData; // final exported value
let appdata; // temporary value for editing
const herodata = get(HeroData); // data from HeroData store
const mastercomps = get(TestComps); // data from TestComps store

// validation function for MH.List
window.validateMyHeroData = async function(data) {
	const expectedProps = [
		{name: 'claimed', default: false},
		{name: 'ascendLv', default: 0},
		{name: 'furn', default: 0},
		{name: 'si', default: 0},
	];

	// make sure that data is an object (and nothing else)
	// https://javascript.plainenglish.io/javascript-check-if-a-variable-is-an-object-and-nothing-else-not-an-array-a-set-etc-a3987ea08fd7
	if(Object.prototype.toString.call(data) !== '[object Object]') return { retCode: 1, message: 'My Hero List data must be a plain Javascript object.'};

	// data must be an object at this point, so make sure it's consistent with the format we expect
	for(let i = 0; i < herodata.length; i++) {
		if(!(herodata[i].id in data)) {
			// add a hero key to data if it's missing
			data[herodata[i].id] = { claimed: false, ascendLv: 0, furn: 0, si: 0, };
		} else {
			// add properties to heroes if they're missing
			for(const prop of expectedProps) {
				if(!(prop.name in data[herodata[i].id])) {
					data[herodata[i].id][prop.name] = prop.default;
				}
			}
		}
	}
	for(const key in data) {
		// delete any keys in data that aren't an id in herodata
		if(!herodata.some(e => e.id === key)) delete data[key];
		// delete extra properties 
		for(const prop in data[key]) {
			if(!expectedProps.some(e => e.name === prop)) delete data[key][prop];
		}
	}

	// everything should be good now, return the clean MH.List object
	return {retCode: 0, message: data};
}

// validation function for Comps
window.validateComp = async function(data) {
	const expectedProps = [
		{name: 'name', default: ''},
		{name: 'uuid', default: ''},
		{name: 'desc', default: ''},
		{name: 'starred', default: false},
		{name: 'author', default: ''},
		{name: 'lastUpdate', default: new Date()},
		{name: 'heroes', default: {}},
		{name: 'lines', default: []},
		{name: 'subs', default: []},
	];
	const expectedHeroProps = [
		{name: 'ascendLv', default: 0},
		{name: 'si', default: 0},
		{name: 'furn', default: 0},
		{name: 'artifact', default: []},
		{name: 'core', default: false},
	];
	const expectedSubProps = [
		{name: 'name', default: ''},
		{name: 'heroes', default: []},
	];
	const expectedLineProps = [
		{name: 'name', default: ''},
		{name: 'heroes', default: []},
	];

	// make sure that data is an object (and nothing else)
	// https://javascript.plainenglish.io/javascript-check-if-a-variable-is-an-object-and-nothing-else-not-an-array-a-set-etc-a3987ea08fd7
	if(Object.prototype.toString.call(data) !== '[object Object]') return { retCode: 1, message: 'Comp data must be a plain Javascript object.'};

	// data must be an object at this point, so make sure it's consistent with the format we expect
	for(const prop of expectedProps) {
		if(!(prop.name in data)) {
			// add property to data if it's missing
			data[prop.name] = prop.default;
		}
	}
	for(const key in data) {
		// delete any keys in data that aren't expected
		if(!expectedProps.some(e => e.name === key)) delete data[key];
	}
	// there should always be at least 1 line in lines
	if(data.lines.length < 1) data.lines.push({name: 'Optimal', heroes: []});
	for(let line of data.lines) {
		// each line should be an object
		if(Object.prototype.toString.call(line) !== '[object Object]') line = {name: 'Optimal', heroes: []};
		for(const prop of expectedLineProps) {
			if(!(prop.name in line)) {
				// add property to line if it's missing
				line[prop.name] = prop.default;
			}
		}
		for(const key in line) {
			// delete any keys in line that aren't expected
			if(!expectedLineProps.some(e => e.name === key)) delete line[key];
		}
		for(const hero of line.heroes) {
			// make sure every hero in a line is also in heroes
			if(!(hero in data.heroes)) data.heroes[hero] = {};
		}
	}
	for(let subCat of data.subs) {
		for(const prop of expectedSubProps) {
			// make sure each sub category object has the right props
			if(!(prop.name in subCat)) subCat[prop.name] = prop.default;
		}
		for(const key in subCat) {
			// make sure there are no extra props on sub categories
			if(!expectedSubProps.some(e => e.name === key)) delete subCat[key];
		}
		for(const hero of subCat.heroes) {
			// make sure every hero in a sub category is also in heroes
			if(!(hero in data.heroes)) data.heroes[hero] = {};
		}
	}
	for(const hero in data.heroes) {
		for(const prop of expectedHeroProps) {
			// make sure heroes have the right props
			if(!(prop.name in data.heroes[hero])) data.heroes[hero][prop.name] = prop.default;
		}
		for(const key in data.heroes[hero]) {
			// make sure there are no extra props on heroes
			if(!expectedHeroProps.some(e => e.name === key)) delete data.heroes[hero][key];
		}
	}

	// everything should be good now, return the clean MH.List object
	return {retCode: 0, message: data};
}

// update master comps if necessary
function updateTestComps(appdata) {
	let i;
	for(const mcomp of mastercomps) {
		if(appdata.Comps.some(e => e.uuid === mcomp.uuid)) {
			i = appdata.Comps.findIndex(e => e.uuid === mcomp.uuid);
			if(mcomp.lastUpdate > appdata.Comps[i].lastUpdate) {
				appdata.Comps[i] = mcomp;
			}
		}
	}
}

// perform a consistency check on MH.List
async function performMHValidation() {
	const returnObj = await validateMyHeroData(appdata.MH.List);
	if(returnObj.retCode !== 0) {
		// validation error occurred
		throw new Error(`MH.List validation error occurred: ${returnObj.message}`);
	} else {
		// message should contain a clean MH.List data object now
		appdata.MH.List = returnObj.message;
	}
}

// perform a consistency check on Comps
async function performCompsValidation() {
	let returnObj;
	for(let comp of appdata.Comps) {
		returnObj = await validateComp(comp);
		if(returnObj.retCode !== 0) {
			// validation error occurred
			throw new Error(`Comp validation error occurred for comp named ${comp.name}: ${returnObj.message}`);
		} else {
			// message should contain a clean comp data object now
			comp = returnObj.message;
		}
	}
}

if(window.localStorage.getItem('appData') !== null) {
	// Load AppData from localstorage if it exists
	appdata = JSON.parse(window.localStorage.getItem('appData'))
	appdata.HL.SearchStr = '';
	appdata.MH.SearchStr = '';
	// JSON doesn't parse date objects correctly, so need to re-initialize them
	for(let comp of appdata.Comps) {
		comp.lastUpdate = new Date(comp.lastUpdate);
	}
	updateTestComps(appdata);
} else {
	// Otherwise initialize a clean AppData
	appdata = {
		activeView: 'comps',
		selectedComp: null,
		dismissImportWarn: false,
		HL: {
			Sort: 'name',
			Order: 'asc',
			SearchStr: '',
			ShowLB: true,
			ShowM: true,
			ShowW: true,
			ShowGB: true,
			ShowC: true,
			ShowH: true,
			ShowD: true,
			ShowInt: true,
			ShowAgi: true,
			ShowStr: true,
			ShowMage: true,
			ShowWar: true,
			ShowTank: true,
			ShowSup: true,
			ShowRan: true,
		},
		MH: {
			Sort: 'name',
			Order: 'asc',
			SearchStr: '',
			ShowLB: true,
			ShowM: true,
			ShowW: true,
			ShowGB: true,
			ShowC: true,
			ShowH: true,
			ShowD: true,
			ShowInt: true,
			ShowAgi: true,
			ShowStr: true,
			ShowMage: true,
			ShowWar: true,
			ShowTank: true,
			ShowSup: true,
			ShowRan: true,
			List: {},
		},
		REC: {
			openSection: 0,
		},
		Comps: mastercomps,
	};
}

performMHValidation();
performCompsValidation();

AppData = writable(appdata);

export default AppData;
