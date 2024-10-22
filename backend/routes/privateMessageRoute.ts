import express, { Router, Request, Response, NextFunction } from "express";
import { Collection, ObjectId } from "mongodb";
import { connect, db } from "../data/dbConnection.js";
import jwt from 'jsonwebtoken';
import { logWithLocation } from "../helpers/betterConsoleLog.js";

// TODO:
// create routet
// authentification for DM
// -- API --
	// GET DM's 
	// POST DM

// Joi validation
