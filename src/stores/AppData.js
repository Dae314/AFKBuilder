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
		{name: 'claimed', type: 'boolean', },
		{name: 'ascendLv', type: 'number', },
		{name: 'furn', type: 'number', },
		{name: 'si', type: 'number', },
	];

	// make sure that data is an object (and nothing else)
	if(!isObject(data)) return { retCode: 1, message: 'My Hero List data must be a plain Javascript object.'};

	// data must be an object at this point, so make sure it's consistent with the format we expect
	for(const key in data) {
		// error if any keys aren't an id in heroData
		if(!herodata.some(e => e.id === key)) {
			return {retCode: 1, message: `Unexpected key found in hero list: ${key}`};
		}
		for(const prop in data[key]) {
			// error if there are extra props
			if(!expectedProps.some(e => e.name === prop)) {
				return {retCode: 1, message: `Unexpected prop found for ${key} key: ${prop}`};
			}
			// error if props are the wrong type
			let expectedPropType = expectedProps.find(e => e.name === prop).type;
			if(!compareType(data[key][prop], expectedPropType)) {
				return {retCode: 1, message: `Incorrect type for prop ${prop} in key ${key}, expected ${expectedPropType}`};
			}
		}
	}

	// everything should be good now, return the validated MH.List object
	return {retCode: 0, message: data};
}

// validation function for Comps
window.validateComp = async function(data) {
	const expectedProps = [
		{name: 'name', type: 'string'},
		{name: 'uuid', type: 'string'},
		{name: 'desc', type: 'string'},
		{name: 'starred', type: 'boolean'},
		{name: 'draft', type: 'boolean'},
		{name: 'author', type: 'string'},
		{name: 'lastUpdate', type: 'date'},
		{name: 'heroes', type: 'object'},
		{name: 'lines', type: 'array'},
		{name: 'subs', type: 'array'},
	];
	const expectedHeroProps = [
		{name: 'ascendLv', type: 'number'},
		{name: 'si', type: 'number'},
		{name: 'furn', type: 'number'},
		{name: 'artifact', type: 'array'},
		{name: 'core', type: 'boolean'},
	];
	const expectedSubProps = [
		{name: 'name', type: 'string'},
		{name: 'heroes', type: 'array'},
	];
	const expectedLineProps = [
		{name: 'name', type: 'string'},
		{name: 'heroes', type: 'array'},
	];
	let expectedPropType = '';

	// make sure that data is an object (and nothing else)
	if(!isObject(data)) return { retCode: 1, message: 'Comp data must be a plain Javascript object.'};

	// data must be an object at this point, so make sure it's consistent with the format we expect
	// make sure all properties are there
	for(const prop of expectedProps) {
		if(!(prop.name in data)) {
			return {retCode: 1, message: `Data is missing property: ${prop.name}`}
		}
	}
	// make sure there are no unexpected keys and all keys are the right type
	for(const key in data) {
		if(!expectedProps.some(e => e.name === key)) {
			return {retCode: 1, message: `Unexpected key found in comp: ${key}`};
		}
		expectedPropType = expectedProps.find(e => e.name === key).type
		if(!compareType(data[key], expectedPropType)) {
			return {retCode: 1, message: `Incorrect type for key ${key}, expected ${expectedPropType}`};
		}
	}
	// perform detailed checks on finalized comps
	if(!data.draft) {
		if(data.lines.length < 1) return {retCode: 1, message: 'Comps must have at least 1 line'};
		if(data.name === '') return {retcode: 1, message: 'Comp title cannot be blank'};
		// line validation
		for(let line of data.lines) {
			// each line should be an object
			if(!isObject(line)) {
				return {retCode: 1, message: `Unexpected line object type detected. All lines should be objects.`};
			}
			// make sure all properties are there
			for(const prop of expectedLineProps) {
				if(!(prop.name in line)) {
					return {retCode: 1, message: `Line named ${line.name} is missing expected property ${prop.name}`};
				}
			}
			// make sure there are no unexpected keys and all keys are the right type
			for(const key in line) {
				if(!expectedLineProps.some(e => e.name === key)) {
					return {retCode: 1, message: `Unexpected key found in line named ${line.name}: ${key}`};
				}
				expectedPropType = expectedLineProps.find(e => e.name === key).type;
				if(!compareType(line[key], expectedPropType)) {
					return {retCode: 1, message: `Incorrect type for key ${key} in line named ${line.name}, expected ${expectedPropType}`};
				}
			}
			// make sure every hero in a line is also in heroes
			for(const hero of line.heroes) {
				if(!(hero in data.heroes)) {
					return {retCode: 1, message: `Hero ${hero} in line named ${line.name} is not in heroes`};
				}
			}
		}
		// sub validation
		for(let sub of data.subs) {
			// each sub line should be an object
			if(!isObject(sub)) {
				return {retCode: 1, message: `Unexpected sub object type detected. All subs should be objects.`};
			}
			// make sure each sub category object has the right props
			for(const prop of expectedSubProps) {
				if(!(prop.name in sub)) {
					return {retCode: 1, message: `Sub line named ${sub.name} is missing expected property ${prop.name}`};
				}
			}
			// make sure there are no unexpected keys and all keys are the right type
			for(const key in sub) {
				if(!expectedSubProps.some(e => e.name === key)) {
					return {retCode: 1, message: `Unexpected key found in sub line named ${sub.name}: ${key}`};
				}
				expectedPropType = expectedSubProps.find(e => e.name === key).type;
				if(!compareType(sub[key], expectedPropType)) {
					return {retCode: 1, message: `Incorrect type for key ${key} in sub line named ${sub.name}, expected ${expectedPropType}`};
				}
			}
			// make sure every hero in a sub line is also in heroes
			for(const hero of sub.heroes) {
				if(!(hero in data.heroes)) {
					return {retCode: 1, message: `Hero ${hero} in sub line named ${sub.name} is not in heroes`};
				}
			}
		}
		// heroes validation
		for(const hero in data.heroes) {
			// make sure all heroes are in HeroData
			if(!(herodata.some(e => e.id === hero))) {
				return {retCode: 1, message: `Hero ${hero} is not an ID in HeroData`};
			}
			// each hero should be an object
			if(!isObject(data.heroes[hero])) {
				return {retCode: 1, message: `Unexpected hero object type detected. All heroes should be objects.`};
			}
			// make sure heroes have the right props
			for(const prop of expectedHeroProps) {
				if(!(prop.name in data.heroes[hero])) {
					return {retCode: 1, message: `Hero named ${hero} is missing expected property ${prop.name}`};
				}
			}
			// make sure there are no unexpected keys and all keys are the right type
			for(const key in data.heroes[hero]) {
				if(!expectedHeroProps.some(e => e.name === key)) {
					return {retCode: 1, message: `Unexpected key found in hero named ${hero}: ${key}`};
				}
				expectedPropType = expectedHeroProps.find(e => e.name === key).type;
				if(!compareType(data.heroes[hero][key], expectedPropType)) {
					return {retCode: 1, message: `Incorrect type for key ${key} in hero named ${hero}, expected ${expectedPropType}`};
				}
			}
		}
	}

	// everything should be good now, return the clean Comp object
	return {retCode: 0, message: data};
}

// update test comps if necessary
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

// function to build or add in new heroes from HeroData into MH.List
function buildMyHeroData(data) {
	const expectedProps = [
		{name: 'claimed', default: false},
		{name: 'ascendLv', default: 0},
		{name: 'furn', default: 0},
		{name: 'si', default: 0},
	];

	// make sure that data is an object (and nothing else)
	// https://javascript.plainenglish.io/javascript-check-if-a-variable-is-an-object-and-nothing-else-not-an-array-a-set-etc-a3987ea08fd7
	if(!isObject(data)) throw new Error('My Hero List data must be a plain Javascript object.');

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
	return data;
}

// utility function returns true iff data is an object (and nothing else)
function isObject(data) {
	// https://javascript.plainenglish.io/javascript-check-if-a-variable-is-an-object-and-nothing-else-not-an-array-a-set-etc-a3987ea08fd7
	return Object.prototype.toString.call(data) === '[object Object]';
}

// utility function returns true iff data is a date object
function isDate(data) {
	return Object.prototype.toString.call(data) === '[object Date]';
}

// utility function returns true iff type of data matches type
function compareType(data, type) {
	switch(type) {
		case 'object':
			return isObject(data);
		case 'array':
			return Array.isArray(data);
		case 'date':
			return isDate(data);
		case 'boolean':
		case 'number':
		case 'string':
		case 'undefined':
		case 'bigint':
		case 'symbol':
			return (typeof data === type);
		default:
			throw new Error(`Invalid type specified: ${type}. Must be object, array, boolean, number, string, undefined, bigint, or symbol.`);
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
	// rebuild MH.List - adds new heroes from HeroData
	appdata.MH.List = buildMyHeroData(appdata.MH.List);
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
			List: buildMyHeroData({}), // build a new MH.List by sending the builder a blank object
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
