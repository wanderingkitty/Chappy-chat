// import express, { Request, Response } from 'express';
// import { connect, db } from '../data/dbConnection';
// import { ObjectId } from 'mongodb';
// import { authenticate } from "../data/authMiddleware.js"; 


// const privateMessageRouter = express.Router();

// // privateMessageRoute.ts
// privateMessageRouter.get('/my', authenticate, async (req: Request, res: Response): Promise<void> => {
// 	if (!(req as any).user) {
// 		res.status(401).json({ error: 'Authentication required' });
// 	}
	
// 	try {
// 		await connect();
// 		const privateMessagesCollection = db.collection('private-messages');
		
// 	}
// })


// export { privateMessageRouter };