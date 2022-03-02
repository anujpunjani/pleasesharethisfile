const router = require("express").Router();
const req = require("express/lib/request");
const File = require("../models/File");

router.get("/:uuid", async (request, response) => {
	try {
		const file = await File.findOne({ uuid: request.params.uuid });
		if (!file) {
			return response.render("download", {
				error: "Link has been expired.",
			});
		}

		return response.render("download", {
			uuid: file.uuid,
			fileName: file.filename,
			fileSize: file.size,
			downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`,
		});
	} catch (error) {
		return response.render("download", { error: "Something went wrong." });
	}
});

module.exports = router;
