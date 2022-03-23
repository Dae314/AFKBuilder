import { get, writable } from 'svelte/store';
import HeroData from './HeroData.js';
// import TestComps from './TestComps.js'

let AppData; // final exported value
let appdata; // temporary value for editing
const herodata = get(HeroData); // data from HeroData store
const maxDescLen = 5000;
const maxCompTags = 10;
const maxNoteLen = 280;
// const testcomps = get(TestComps); // data from TestComps store

// validation function for MH.List
window.validateMyHeroData = async function(data) {
	const expectedProps = [
		{name: 'claimed', type: 'boolean', },
		{name: 'ascendLv', type: 'number', },
		{name: 'furn', type: 'number', },
		{name: 'si', type: 'number', },
		{name: 'copies', type: 'number', },
		{name: 'stars', type: 'number', },
		{name: 'engraving', type: 'number', },
	];

	// make sure that data is an object (and nothing else)
	if(!isObject(data)) return { retCode: 1, message: 'My Hero List data must be a plain Javascript object.'};

	// data must be an object at this point, so make sure it's consistent with the format we expect
	for(const key in data) {
		// error if any keys aren't an id in heroData
		if(!herodata.some(e => e.id === key)) {
			return {retCode: 1, message: `Unexpected key found in hero list: ${key}`};
		}
		
		// add the stars and engraving properties to heroes if they're missing (update 1.12.0)
		if(!('stars' in data[key])) data[key].stars = 0;
		if(!('engraving' in data[key])) data[key].engraving = 0;

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
		{name: 'tags', type: 'array'},
		{name: 'hidden', type: 'boolean'},
		{name: 'source', type: 'string'},
		{name: 'groups', type: 'array'},
	];
	const expectedHeroProps = [
		{name: 'ascendLv', type: 'number'},
		{name: 'si', type: 'number'},
		{name: 'furn', type: 'number'},
		{name: 'stars', type: 'number'},
		{name: 'engraving', type: 'number'},
		{name: 'artifacts', type: 'object'},
		{name: 'core', type: 'boolean'},
		{name: 'notes', type: 'string'},
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
	if(!('hidden' in data)) data.hidden = false; // add hidden attribute - March 2022 API update
	if(!('source' in data)) data.source = 'local'; // add source attribute - March 2022 API update
	if(!('groups' in data)) data.groups = []; // add groups attribute - March 2022 API update
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
			// make sure every hero in a line is also in heroes or is unknown
			for(const hero of line.heroes) {
				if(!(hero in data.heroes) && hero !== 'unknown') {
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
			// add the stars and engraving properties to heroes if they're missing (update 1.12.0)
			if(!('stars' in data.heroes[hero])) data.heroes[hero].stars = 0;
			if(!('engraving' in data.heroes[hero])) data.heroes[hero].engraving = 0;

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
			// make sure that hero notes isn't longer than max
			if(data.heroes[hero].notes.length > maxNoteLen) return {retCode: 1, message: `Hero notes for ${hero} cannot be longer than ${maxNoteLen} characters.`};
		}
		// make sure the description isn't longer than max
		if(data.desc.length > maxDescLen) return {retCode: 1, message: `Description cannot be longer than ${maxDescLen} characters.`};
		// make sure the number of tags is under max
		if(data.tags.length > maxCompTags) return {retCode: 1, message: `Comps can have a max of ${maxCompTags} tags.`};
	}

	// tag syntax cleanup added for DB update
	const tagCheck = new RegExp('^[A-Za-z0-9-_.~]*$');
	data.tags = data.tags.map(e => {
		const retVal = e.replace(/ /g, '_') // replace all spaces with _
										.replace(/\+/g, '-') // replace all + with -
										.replace(/[^A-Za-z0-9-_.~]/g, '.') // replace all other invalid characters with .
		if(tagCheck.test(retVal)) {
			return retVal;
		} else {
			return 'invalid-tag';
		}
	});

	// everything should be good now, return the clean Comp object
	return {retCode: 0, message: data};
}

// update test comps if necessary
// function updateTestComps(appdata) {
// 	let i;
// 	for(const mcomp of testcomps) {
// 		if(appdata.Comps.some(e => e.uuid === mcomp.uuid)) {
// 			i = appdata.Comps.findIndex(e => e.uuid === mcomp.uuid);
// 			if(mcomp.lastUpdate > appdata.Comps[i].lastUpdate) {
// 				appdata.Comps[i] = mcomp;
// 			}
// 		}
// 	}
// }

// function to build or add in new app data top level structures
function buildAppData(data) {
	const expectedProps = [
		{name: 'activeView', default: 'comps'},
		{name: 'selectedComp', default: null},
		{name: 'selectedUUID', default: null},
		{name: 'dismissImportWarn', default: false},
		{name: 'dismissHLSearchInfo', default: false},
		{name: 'dismissMHSearchInfo', default: false},
		{name: 'dismissCookieConsent', default: false},
		{name: 'expandHeader', default: false},
		{name: 'maxDescLen', default: maxDescLen},
		{name: 'maxCompTags', default: maxCompTags},
		{name: 'maxNoteLen', default: maxNoteLen},
		{name: 'compShowHidden', default: false},
		{name: 'compGroups', default: []},
		{name: 'compLastUpdate', default: new Date('January 1, 1990 03:00:00')},
		{name: 'user', default: {}},
		{name: 'HL', default: {}},
		{name: 'MH', default: {}},
		{name: 'REC', default: {}},
		{name: 'Comps', default: []},
	];
	const expectedUserProps = [
		{name: 'jwt', default: ''},
		{name: 'username', default: ''},
		{name: 'id', default: ''},
		{name: 'avatar', default: ''},
		{name: 'local_comps', default: {}},
		{name: 'my_heroes', default: {}},
		{name: 'liked_comps', default: []},
		{name: 'disliked_comps', default: []},
		{name: 'published_comps', default: []},
		{name: 'saved_comps', default: []},
	]
	const expectedHLProps = [
		{name: 'Sort', default: 'name'},
		{name: 'Order', default: 'asc'},
		{name: 'SearchStr', default: ''},
		{name: 'ShowLB', default: true},
		{name: 'ShowM', default: true},
		{name: 'ShowW', default: true},
		{name: 'ShowGB', default: true},
		{name: 'ShowC', default: true},
		{name: 'ShowH', default: true},
		{name: 'ShowD', default: true},
		{name: 'ShowInt', default: true},
		{name: 'ShowAgi', default: true},
		{name: 'ShowStr', default: true},
		{name: 'ShowMage', default: true},
		{name: 'ShowWar', default: true},
		{name: 'ShowTank', default: true},
		{name: 'ShowSup', default: true},
		{name: 'ShowRan', default: true},
	];
	const expectedMHProps = [
		{name: 'Sort', default: 'name'},
		{name: 'Order', default: 'asc'},
		{name: 'SearchStr', default: ''},
		{name: 'ShowLB', default: true},
		{name: 'ShowM', default: true},
		{name: 'ShowW', default: true},
		{name: 'ShowGB', default: true},
		{name: 'ShowC', default: true},
		{name: 'ShowH', default: true},
		{name: 'ShowD', default: true},
		{name: 'ShowInt', default: true},
		{name: 'ShowAgi', default: true},
		{name: 'ShowStr', default: true},
		{name: 'ShowMage', default: true},
		{name: 'ShowWar', default: true},
		{name: 'ShowTank', default: true},
		{name: 'ShowSup', default: true},
		{name: 'ShowRan', default: true},
		{name: 'lastUpdate', default: new Date('January 1, 1990 03:00:00')},
		{name: 'List', default: {}},
		{name: 'openSection', default: 0},
	];
	const expectedRECProps = [
		{name: 'openSection', default: 0},
	];
	const expectedGroupProps = [
		{name: 'name', default: 'New Group'},
		{name: 'uuid', default: ''},
		{name: 'comps', default: []},
		{name: 'createdAt', default: new Date()}
	];

	// make sure that data is an object (and nothing else)
	if(!isObject(data)) throw new Error('AppData must be a plain Javascript object.');

	// data must be an object at this point, so make sure it's consistent with the format we expect
	// add top-level props as required
	for(const prop of expectedProps) {
		if(!(prop.name in data)) data[prop.name] = prop.default;
	}
	// delete extra top-level props
	for(let prop in data) {
		if(!expectedProps.some(e => e.name === prop)) delete data[prop];
	}
	// limits are special and should always be updated
	data.maxDescLen = expectedProps.find(e => e.name === 'maxDescLen').default;
	data.maxCompTags = expectedProps.find(e => e.name === 'maxCompTags').default;
	data.maxNoteLen = expectedProps.find(e => e.name === 'maxNoteLen').default;

	// add User props as required
	for(const prop of expectedUserProps) {
		if(!(prop.name in data.user)) data.user[prop.name] = prop.default;
	}
	// delete extra User props
	for(let prop in data.user) {
		if(!expectedUserProps.some(e => e.name === prop)) delete data.user[prop];
	}

	// add HL props as required
	for(const prop of expectedHLProps) {
		if(!(prop.name in data.HL)) data.HL[prop.name] = prop.default;
	}
	// delete extra HL props
	for(let prop in data.HL) {
		if(!expectedHLProps.some(e => e.name === prop)) delete data.HL[prop];
	}

	// add MH props as required
	for(const prop of expectedMHProps) {
		if(!(prop.name in data.MH)) data.MH[prop.name] = prop.default;
	}
	// delete extra MH props
	for(let prop in data.MH) {
		if(!expectedMHProps.some(e => e.name === prop)) delete data.MH[prop];
	}
	// rebuild MH.List
	data.MH.List = buildMyHeroData(data.MH.List);

	// add REC props as required
	for(const prop of expectedRECProps) {
		if(!(prop.name in data.REC)) data.REC[prop.name] = prop.default;
	}
	// delete extra REC props
	for(let prop in data.REC) {
		if(!expectedRECProps.some(e => e.name === prop)) delete data.REC[prop];
	}

	// rebuild comp groups
	for(let group of data.compGroups) {
		// add group props as required
		for(const prop of expectedGroupProps) {
			if(!(prop.name in group)) group[prop.name] = prop.default;
		}
		// delete extra group props
		for(let prop in group) {
			if(!expectedGroupProps.some(e => e.name === prop)) delete group[prop];
		}
	}

	// rebuild Comps
	data.Comps = buildCompsData(data.Comps);

	// everything should be good now, return the clean AppData object
	return data;
}

// function to build or add in new heroes from HeroData into MH.List
function buildMyHeroData(data) {
	const expectedProps = [
		{name: 'claimed', default: false},
		{name: 'ascendLv', default: 0},
		{name: 'furn', default: 0},
		{name: 'si', default: 0},
		{name: 'copies', default: 0},
		{name: 'stars', default: 0},
		{name: 'engraving', default: 0},
	];

	// make sure that data is an object (and nothing else)
	if(!isObject(data)) throw new Error('My Hero List data must be a plain Javascript object.');

	// data must be an object at this point, so make sure it's consistent with the format we expect
	for(let i = 0; i < herodata.length; i++) {
		if(!(herodata[i].id in data)) {
			// add a hero key to data if it's missing
			data[herodata[i].id] = { claimed: false, ascendLv: 0, furn: 0, si: -1, };
		} else {
			// add properties to heroes if they're missing
			for(const prop of expectedProps) {
				if(!(prop.name in data[herodata[i].id])) {
					data[herodata[i].id][prop.name] = prop.default;
				}
			}
		}
		// reset ascendLv, SI, and Furn if the hero is unclaimed
		if(!data[herodata[i].id].claimed) {
			data[herodata[i].id].ascendLv = 0;
			data[herodata[i].id].furn = 0;
			data[herodata[i].id].si = -1;
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

// function to build or add new props to objects in the Comp array
function buildCompsData(data) {
	const expectedProps = [
		{name: 'author', default: ''},
		{name: 'desc', default: ''},
		{name: 'draft', default: false},
		{name: 'heroes', default: {}},
		{name: 'lastUpdate', default: new Date()},
		{name: 'lines', default: []},
		{name: 'name', default: ''},
		{name: 'starred', default: false},
		{name: 'subs', default: []},
		{name: 'uuid', default: ''},
		{name: 'tags', default: []},
		{name: 'hidden', default: false},
		{name: 'source', default: 'local'},
	];
	const expectedHeroProps = [
		{name: 'ascendLv', default: 6},
		{name: 'si', default: 20},
		{name: 'furn', default: 3},
		{name: 'stars', default: 0},
		{name: 'engraving', default: 0},
		{name: 'artifacts', default: {}},
		{name: 'core', default: false},
		{name: 'notes', default: ''},
	];
	const expectedArtifactsProps = [
		{name: 'primary', default: []},
		{name: 'secondary', default: []},
		{name: 'situational', default: []},
	]
	const expectedLineProps = [
		{name: 'name', default: ''},
		{name: 'heroes', default: ['unknown','unknown','unknown','unknown','unknown']},
	];
	const expectedSubProps = [
		{name: 'name', default: ''},
		{name: 'heroes', default: []},
	]

	// make sure that data is an array
	if(!Array.isArray(data)) throw new Error('Comps must be an array.');

	// data must be an array at this point, so make sure it's consistent with the format we expect
	for(let comp of data) {
		// add top-level props as required
		for(const prop of expectedProps) {
			if(!(prop.name in comp)) comp[prop.name] = prop.default;
		}
		// delete extra top-level props
		for(let prop in comp) {
			if(!expectedProps.some(e => e.name === prop)) delete comp[prop];
		}
		// clean up hero and artifacts props
		for(const hero in comp.heroes) {
			for(const prop of expectedHeroProps) {
				if(!(prop.name in comp.heroes[hero])) comp.heroes[hero][prop.name] = prop.default;
			}
			for(let prop in comp.heroes[hero]) {
				if(!expectedHeroProps.some(e => e.name === prop)) delete comp.heroes[hero][prop];
			}
			for(const prop of expectedArtifactsProps) {
				if(!(prop.name in comp.heroes[hero].artifacts)) comp.heroes[hero].artifacts[prop.name] = prop.default;
			}
			for(let prop in comp.heroes[hero].artifacts) {
				if(!expectedArtifactsProps.some(e => e.name === prop)) delete comp.heroes[hero].artifacts[prop];
			}
		}
		// clean up line props
		for(let line of comp.lines) {
			for(const prop of expectedLineProps) {
				if(!(prop.name in line)) line[prop.name] = prop.default;
			}
			for(let prop in line) {
				if(!expectedLineProps.some(e => e.name === prop)) delete line[prop];
			}
		}
		// clean up sub props
		for(let sub of comp.subs) {
			for(const prop of expectedSubProps) {
				if(!(prop.name in sub)) sub[prop.name] = prop.default;
			}
			for(let prop in sub) {
				if(!expectedSubProps.some(e => e.name === prop)) delete sub[prop];
			}
		}
	}

	// everything should be good now, return the clean Comp object
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
	// rebuild app data structure (adds any new attributes and also rebuilds MH.List)
	appdata = buildAppData(appdata);
	// JSON doesn't parse date objects correctly, so need to re-initialize them
	for(let comp of appdata.Comps) {
		comp.lastUpdate = new Date(comp.lastUpdate);
	}
	for(let group of appdata.compGroups) {
		group.createdAt = new Date(group.createdAt);
	}
	appdata.MH.lastUpdate = new Date(appdata.MH.lastUpdate);
	appdata.compLastUpdate = new Date(appdata.compLastUpdate);
	// updateTestComps(appdata);
} else {
	// Otherwise initialize a clean AppData
	appdata = buildAppData({});
}

performMHValidation();
performCompsValidation();

AppData = writable(appdata);

export default AppData;
