const router = require("express").Router();
const File = require("../models/File");

router.get("/:uuid", async (request, response) => {
	const file = await File.findOne({ uuid: request.params.uuid });
	if (!file) {
		response.render("download", { error: "Link has been expired." });
	}

	const filePath = `${__dirname}/../${file.path}`;
	response.download(filePath);
});

module.exports = router;
