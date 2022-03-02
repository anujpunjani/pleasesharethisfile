const router = require("express").Router();
const multer = require("multer"); // used for uploading files
const path = require("path");
const File = require("../models/File");
const { v4: uuidv4 } = require("uuid");

let storage = multer.diskStorage({
	destination: (request, file, callback) => callback(null, "uploads/"),
	filename: (request, file, callback) => {
		const uniqueName = `${Date.now()}-${Math.round(
			Math.random() * 1e9
		)}${path.extname(file.originalname)}`;
		callback(null, uniqueName);
	},
});

let upload = multer({
	storage: storage,
	limits: { fileSize: 1000000 * 100 },
}).single("myfile");

router.post("/", (request, response) => {
	// Store file
	upload(request, response, async (error) => {
		// Validate request
		if (!request.file) {
			return res.json({ error: "All fields are required." });
		}

		if (error) {
			return response.status(500).send({ error: error.message });
		}

		// Store into Database
		const file = new File({
			filename: request.file.filename,
			uuid: uuidv4(),
			path: request.file.path,
			size: request.file.size,
		});

		// Respnse -> Link
		const res = await file.save();
		return response.json({
			file: `${process.env.APP_BASE_URL}/files/${res.uuid}`,
		});
	});
});

router.post("/send", async (request, response) => {
	const { uuid, emailTo, emailFrom } = request.body;
	// Validate request
	if (!uuid || !emailTo || !emailFrom) {
		return response.status(442).send({ error: "All fields are required." });
	}

	// Get data from database
	const file = await File.findOne({ uuid: uuid });
	if (file.sender) {
		return response.status(442).send({ error: "Email already sent." });
	}

	file.sender = emailFrom;
	file.receiver = emailTo;

	const res = await file.save();

	// Send email
	const sendMail = require("../services/emailService");
	sendMail({
		from: emailFrom,
		to: emailTo,
		subject: "inShare file sharing",
		text: `${emailFrom} shared a file with you.`,
		html: require("../services/emailTemplate")({
			emailFrom: emailFrom,
			downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
			size: parseInt(file.size / 1000) + " KB",
			expires: "24 hours",
		}),
	});

	return response.send({ success: true });
});

module.exports = router;
