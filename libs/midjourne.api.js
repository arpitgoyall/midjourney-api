"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MidjourneyApi = void 0;
const tslib_1 = require("tslib");
const interfaces_1 = require("./interfaces");
const queue_1 = require("./queue");
const utls_1 = require("./utls");
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const mime = tslib_1.__importStar(require("mime"));
const command_1 = require("./command");
class MidjourneyApi extends command_1.Command {
    config;
    apiQueue = (0, queue_1.CreateQueue)(1);
    UpId = Date.now() % 10; // upload id
    constructor(config) {
        super(config);
        this.config = config;
    }
    // limit the number of concurrent interactions
    async safeIteractions(payload) {
        return this.apiQueue.addTask(() => new Promise((resolve) => {
            this.interactions(payload, (res) => {
                resolve(res);
            });
        }));
    }
    async interactions(payload, callback) {
        try {
            const headers = {
                "Content-Type": "application/json",
                Authorization: this.config.SalaiToken,
            };
            const response = await this.config.fetch(`${this.config.DiscordBaseUrl}/api/v9/interactions`, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: headers,
            });
            if (response.status >= 400) {
                console.error("api.error.config", {
                    payload: JSON.stringify(payload),
                    config: this.config,
                });
            }
            callback && callback(response.status);
            //discord api rate limit
            await (0, utls_1.sleep)(950);
            return response.status;
        }
        catch (error) {
            console.error(error);
            callback && callback(500);
        }
    }
    async ImagineApi(prompt, nonce = (0, utls_1.nextNonce)()) {
        const payload = await this.imaginePayload(prompt, nonce);
        return this.safeIteractions(payload);
    }
    async SwitchRemixApi(nonce = (0, utls_1.nextNonce)()) {
        const payload = await this.PreferPayload(nonce);
        return this.safeIteractions(payload);
    }
    async ShortenApi(prompt, nonce = (0, utls_1.nextNonce)()) {
        const payload = await this.shortenPayload(prompt, nonce);
        return this.safeIteractions(payload);
    }
    async VariationApi({ index, msgId, hash, nonce = (0, utls_1.nextNonce)(), flags = 0, }) {
        return this.CustomApi({
            msgId,
            customId: `MJ::JOB::variation::${index}::${hash}`,
            flags,
            nonce,
        });
    }
    async UpscaleApi({ index, msgId, hash, nonce = (0, utls_1.nextNonce)(), flags, }) {
        return this.CustomApi({
            msgId,
            customId: `MJ::JOB::upsample::${index}::${hash}`,
            flags,
            nonce,
        });
    }
    async RerollApi({ msgId, hash, nonce = (0, utls_1.nextNonce)(), flags, }) {
        return this.CustomApi({
            msgId,
            customId: `MJ::JOB::reroll::0::${hash}::SOLO`,
            flags,
            nonce,
        });
    }
    async ZoomOutApi({ level, msgId, hash, nonce = (0, utls_1.nextNonce)(), flags, }) {
        let customId;
        switch (level) {
            case "high":
                customId = `MJ::JOB::high_variation::1::${hash}::SOLO`;
                break;
            case "low":
                customId = `MJ::JOB::low_variation::1::${hash}::SOLO`;
                break;
            case "2x":
                customId = `MJ::Outpaint::50::1::${hash}::SOLO`;
                break;
            case "1.5x":
                customId = `MJ::Outpaint::75::1::${hash}::SOLO`;
                break;
        }
        return this.CustomApi({
            msgId,
            customId: customId,
            flags,
            nonce,
        });
    }
    async CustomApi({ msgId, customId, flags, nonce = (0, utls_1.nextNonce)(), }) {
        const payload = {
            type: 3,
            nonce,
            guild_id: this.config.ServerId,
            channel_id: this.config.ChannelId,
            message_flags: flags,
            message_id: msgId,
            application_id: "936929561302675456",
            session_id: this.config.SessionId,
            data: {
                component_type: 2,
                custom_id: customId,
            },
        };
        return this.safeIteractions(payload);
    }
    //FIXME: get SubmitCustomId from discord api
    async ModalSubmitApi({ nonce, msgId, customId, prompt, submitCustomId, }) {
        var payload = {
            type: 5,
            application_id: "936929561302675456",
            channel_id: this.config.ChannelId,
            guild_id: this.config.ServerId,
            data: {
                id: msgId,
                custom_id: customId,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 4,
                                custom_id: submitCustomId,
                                value: prompt,
                            },
                        ],
                    },
                ],
            },
            session_id: this.config.SessionId,
            nonce,
        };
        console.log("submitCustomId", JSON.stringify(payload));
        return this.safeIteractions(payload);
    }
    async RemixApi({ nonce, msgId, customId, prompt, }) {
        return this.ModalSubmitApi({
            nonce,
            msgId,
            customId,
            prompt,
            submitCustomId: interfaces_1.RemixModalSubmitID,
        });
    }
    async ShortenImagineApi({ nonce, msgId, customId, prompt, }) {
        return this.ModalSubmitApi({
            nonce,
            msgId,
            customId,
            prompt,
            submitCustomId: interfaces_1.ShortenModalSubmitID,
        });
    }
    async DescribeImagineApi({ nonce, msgId, customId, prompt, }) {
        return this.ModalSubmitApi({
            nonce,
            msgId,
            customId,
            prompt,
            submitCustomId: interfaces_1.DescribeModalSubmitID,
        });
    }
    async CustomZoomImagineApi({ nonce, msgId, customId, prompt, }) {
        customId = customId.replace("MJ::CustomZoom", "MJ::OutpaintCustomZoomModal");
        return this.ModalSubmitApi({
            nonce,
            msgId,
            customId,
            prompt,
            submitCustomId: interfaces_1.CustomZoomModalSubmitID,
        });
    }
    async InfoApi(nonce) {
        const payload = await this.infoPayload(nonce);
        return this.safeIteractions(payload);
    }
    async SettingsApi(nonce) {
        const payload = await this.settingsPayload(nonce);
        return this.safeIteractions(payload);
    }
    async FastApi(nonce) {
        const payload = await this.fastPayload(nonce);
        return this.safeIteractions(payload);
    }
    async RelaxApi(nonce) {
        const payload = await this.relaxPayload(nonce);
        return this.safeIteractions(payload);
    }
    /**
     *
     * @param fileUrl http or local file path
     * @returns
     */
    async UploadImage(fileUrl) {
        let fileData;
        let mimeType;
        let filename;
        let file_size;
        if (fileUrl.startsWith("http")) {
            const response = await this.config.fetch(fileUrl);
            fileData = await response.arrayBuffer();
            mimeType = response.headers.get("content-type");
            filename = path_1.default.basename(fileUrl) || "image.png";
            file_size = fileData.byteLength;
        }
        else {
            fileData = await fs.promises.readFile(fileUrl);
            mimeType = mime.getType(fileUrl);
            filename = path_1.default.basename(fileUrl);
            file_size = (await fs.promises.stat(fileUrl)).size;
        }
        if (!mimeType) {
            throw new Error("Unknown mime type");
        }
        const { attachments } = await this.attachments({
            filename,
            file_size,
            id: this.UpId++,
        });
        const UploadSlot = attachments[0];
        await this.uploadImage(UploadSlot, fileData, mimeType);
        const response = {
            id: UploadSlot.id,
            filename: path_1.default.basename(UploadSlot.upload_filename),
            upload_filename: UploadSlot.upload_filename,
        };
        return response;
    }
    /**
     * prepare an attachement to upload an image.
     */
    async attachments(...files) {
        const { SalaiToken, DiscordBaseUrl, ChannelId, fetch } = this.config;
        const headers = {
            Authorization: SalaiToken,
            "content-type": "application/json",
        };
        const url = new URL(`${DiscordBaseUrl}/api/v9/channels/${ChannelId}/attachments`);
        const body = { files };
        const response = await this.config.fetch(url, {
            headers,
            method: "POST",
            body: JSON.stringify(body),
        });
        if (response.status === 200) {
            return (await response.json());
        }
        const error = `Attachments return ${response.status} ${response.statusText} ${await response.text()}`;
        throw new Error(error);
    }
    async uploadImage(slot, data, contentType) {
        const body = new Uint8Array(data);
        const headers = { "content-type": contentType };
        const response = await this.config.fetch(slot.upload_url, {
            method: "PUT",
            headers,
            body,
        });
        if (!response.ok) {
            throw new Error(`uploadImage return ${response.status} ${response.statusText} ${await response.text()}`);
        }
    }
    async DescribeApi(image, nonce) {
        const payload = await this.describePayload(image, nonce);
        return this.safeIteractions(payload);
    }
}
exports.MidjourneyApi = MidjourneyApi;
//# sourceMappingURL=midjourne.api.js.map