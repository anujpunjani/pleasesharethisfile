const File = require("./models/File");
const fs = require("fs");
const connectDB = require("./config/db");
connectDB();

async function deleteData() {
	// 24 hours Files
	const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1000 miliseconds

	const files = await File.find({ createrAt: { $lt: pastDate } });
	if (files.length) {
		for (const file of files) {
			try {
				fs.unlinkSync(file.path);
				await file.remove();
				console.log(`successfully deleted ${file.filename}`);
			} catch (error) {
				console.log(`Error while deleting file ${error}`);
			}
		}
		console.log("Job done!");
	}
}

deleteData().then(process.exit);
