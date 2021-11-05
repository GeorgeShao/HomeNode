import {Request, Response, NextFunction} from "express"; //Typescript types
import response from "../models/response"; //Created pre-formatted uniform response
import getResult from "./modules/getResult"; //Creates formatted response
import Intruders from "../models/intruders/intruders"; //Schema for mongodb
import axios from "axios";

/* Import interfaces */
import {intrudersGetQuery, intrudersPostBody, intrudersDailyPutBody, intrudersPastPutBody, intrudersDeleteBody} from "../models/intruders/intudersInterface";


/* Build Functions */

const buildGetQuery = (req: any) => {
	//Create the get request
	let queryType = undefined;
	let query: any = {};
	let undefinedParams: string[] = [];
	switch (req.query.get_type){
		case "all":
			queryType = "all";
			break;
		default:
			if (req.query.id!== undefined){
				query = req.query.id;
				queryType = "id";
			} else if (req.home_id!== undefined){
				query = req.query.home_id;
				queryType = "home_id";
			} else {
				undefinedParams.push("id, home_id");
			}
			let iDQuery: intrudersGetQuery = {};
			query = iDQuery;
	}
	return {queryType: queryType, query: query, errors: undefinedParams};
};
const buildPostBody = (req: any) => {
	//Create the post request
	let exists = false;
	let undefinedParams: string[] = [];
	let body: any = {};
	["name", "home_id", "current_data"].forEach((param) => {
		if (req.body[param]==undefined) undefinedParams.push(param);
	});
	if (undefinedParams.length == 0) { 
		let postBody: intrudersPostBody = {
			name: req.body.name,
			home_id: req.body.home_id,
			current_data: req.body.current_data,
			daily_data: [],
			past_data: [],
		};
		body = postBody;
		exists = true;
	}
	return {exists: exists, body: body, errors: undefinedParams};
};
const buildPutBody = (req: any) => {
	//Create the put request for the daily data array
	let putType = undefined;
	let id = req.body.id;
	let body: any = {};
	let undefinedParams: string[] = [];
	switch (req.query.put_type) {
		case "past_data":
			["date", "intrusion_detections", "max_alert_level"].forEach((param) => {
				if (req.body[param]==undefined) undefinedParams.push(param);
			});
			if (undefinedParams.length == 0) { 
				let pastBody: intrudersPastPutBody = {
					date: req.body.date,
					intrusion_detections: req.body.intrusion_detections,
					max_alert_level: req.body.max_alert_level,
				};
				putType = "past_data";
				body = pastBody;
			}
			break;
		case "daily_data":
			["detection", "alert_level"].forEach((param) => {
				if (req.body[param]==undefined) undefinedParams.push(param);
			});
			if (undefinedParams.length == 0) { 
				let dailyBody: intrudersDailyPutBody = {
					detection: req.body.detection,
					alert_level: req.body.alert_level
				};
				putType = "daily_data";
				body = dailyBody;
			}
			break;
		default:
			undefinedParams.push("put_type");
			break;
	}
	if (id === undefined) putType = undefined;
	return {putType: putType, id: id, body: body, errors: undefinedParams};
};

const buildDeleteBody = (req: any) =>{
	let deleteType = undefined;
	let id = req.body.id;
	let body: any = {};
	let undefinedParams: string[] = [];
	switch (req.query.delete_type){
		case "daily_data":
			["detection", "alert"].forEach((param) => {
				if (req.body[param]==undefined) undefinedParams.push(param);
			});
			if (undefinedParams.length == 0) { 
				let deleteBody: intrudersDeleteBody = {
					detection: req.body.detection,
					alert_level: req.body.alert_level,
				};
				deleteType = "daily_data";
				body = deleteBody;
			}
			break;
		default:
			undefinedParams.push("delete_type");
			break;
	}
	if (id === undefined) deleteType = false;
	return {deleteType: deleteType, id: id, body: body, errors: undefinedParams};
}
/* register controller */
export default class intrudersController {
	static async apiGetIntruders(req: Request, res: Response, next: NextFunction) {
		let result = new response(); //Create new standardized response
		let {queryType, query, errors} = buildGetQuery(req);
		let intruders;
		switch (queryType){
			case "all":
				try{intruders = await Intruders.find();} 
				catch (e: any) {result.errors.push("Query error", e);}
				break;
			case "id":
				try {intruders = await Intruders.findById(query.id);} 
				catch (e: any) {result.errors.push("Query error", e);}
				break;
			case "home_id":
				try {intruders = await Intruders.find(query);}
				catch (e: any) {result.errors.push("Query error", e);}
				break;
			default:
				errors.forEach((error)=> result.errors.push("missing "+error))
		}
		result = getResult(intruders, "intruders", result);
		res.status(result.status).json(result); //Return whatever result remains
	}
	static async apiPostIntruders(req: Request, res: Response, next: NextFunction) {
		let result = new response();
		let {exists, body, errors} = buildPostBody(req);
		let newIntruders;
		if (exists) {
			try {
				newIntruders = new Intruders(body);
				await newIntruders.save(); //Saves branch to mongodb
				const homeData: any = await axios.put("/api/home", {
					id: body.home_id,
					module : {
						type: 'intruders',
						module_id: newIntruders._id 
					}
				});
				let homeResult: any = homeData.data;
				if (homeResult) {
					result.success = homeResult.success;
					result.errors.push(...homeResult.errors);
					result.status = homeResult.status;
					result.response = {
						intruderResult: newIntruders,
						homeResult: homeResult.response,
					};
				} else {
					result.errors.push("Error adding user to home");
					result.response = {intruderResult: newIntruders};
				}
			} catch (e: any) {
				result.errors.push("Error creating request", e);
			}
		} else {
			errors.forEach((error)=>result.errors.push("missing "+error));
		}
		res.status(result.status).json(result);
	}
	static async apiPutIntruders(req: Request, res: Response, next: NextFunction) {
		let result = new response();
		let {putType, id, body, errors} = buildPutBody(req);
		let intruders;
		let updateData: any = {};
		switch (putType){
			case "daily_data":
				updateData = {$push: {daily_data: body}, current_data: body};
				break;
			case "past_data":
				updateData = {$push: {past_data: body}};
				break;
			default:
				errors.forEach((error)=>result.errors.push("Missing "+error));
				putType = undefined;
		}
		if (putType) {
			try {
				//prettier-ignore
				intruders = await Intruders.findByIdAndUpdate(id, updateData, {new:true}); //Saves branch to mongodb
				result.status = 201;
				result.response = intruders;
				result.success = true;
			} catch (e: any) {
				result.status = 404;
				result.errors.push("Error creating request", e);
			}
		}
		res.status(result.status).json(result);
	}
	static async apiDeleteIntruders(req: Request, res: Response, next: NextFunction){
		let result = new response();
		let {deleteType, id, body, errors} = buildDeleteBody(req);
		let intruders;
		switch(deleteType){
			case "daily_data":
				try{
					intruders = await Intruders.findByIdAndUpdate(id, {daily_data: [body]}, {new:true}); //Saves branch to mongodb
					result.status = 201;
					result.response = intruders;
					result.success = true;
				} catch (e: any) {
					result.errors.push("Error creating request", e);
				}
			default:
				errors.forEach((error)=> result.errors.push("missing "+error))
		}
		res.status(result.status).json(result);

	}
}
