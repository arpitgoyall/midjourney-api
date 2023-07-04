import { DiscordImage, MJConfig, ModalSubmitID } from "./interfaces";
import { Command } from "./command";
export declare class MidjourneyApi extends Command {
    config: MJConfig;
    private apiQueue;
    UpId: number;
    constructor(config: MJConfig);
    protected safeIteractions(payload: any): Promise<number>;
    protected interactions(payload: any, callback?: (result: number) => void): Promise<number | undefined>;
    ImagineApi(prompt: string, nonce?: string): Promise<number>;
    SwitchRemixApi(nonce?: string): Promise<number>;
    ShortenApi(prompt: string, nonce?: string): Promise<number>;
    VariationApi({ index, msgId, hash, nonce, flags, }: {
        index: 1 | 2 | 3 | 4;
        msgId: string;
        hash: string;
        nonce?: string;
        flags?: number;
    }): Promise<number>;
    UpscaleApi({ index, msgId, hash, nonce, flags, }: {
        index: 1 | 2 | 3 | 4;
        msgId: string;
        hash: string;
        nonce?: string;
        flags: number;
    }): Promise<number>;
    RerollApi({ msgId, hash, nonce, flags, }: {
        msgId: string;
        hash: string;
        nonce?: string;
        flags: number;
    }): Promise<number>;
    ZoomOutApi({ level, msgId, hash, nonce, flags, }: {
        level: "high" | "low" | "2x" | "1.5x";
        msgId: string;
        hash: string;
        nonce?: string;
        flags: number;
    }): Promise<number>;
    CustomApi({ msgId, customId, flags, nonce, }: {
        msgId: string;
        customId: string;
        flags: number;
        nonce?: string;
    }): Promise<number>;
    ModalSubmitApi({ nonce, msgId, customId, prompt, submitCustomId, }: {
        nonce: string;
        msgId: string;
        customId: string;
        prompt: string;
        submitCustomId: ModalSubmitID;
    }): Promise<number>;
    RemixApi({ nonce, msgId, customId, prompt, }: {
        nonce: string;
        msgId: string;
        customId: string;
        prompt: string;
    }): Promise<number>;
    ShortenImagineApi({ nonce, msgId, customId, prompt, }: {
        nonce: string;
        msgId: string;
        customId: string;
        prompt: string;
    }): Promise<number>;
    DescribeImagineApi({ nonce, msgId, customId, prompt, }: {
        nonce: string;
        msgId: string;
        customId: string;
        prompt: string;
    }): Promise<number>;
    CustomZoomImagineApi({ nonce, msgId, customId, prompt, }: {
        nonce: string;
        msgId: string;
        customId: string;
        prompt: string;
    }): Promise<number>;
    InfoApi(nonce?: string): Promise<number>;
    SettingsApi(nonce?: string): Promise<number>;
    FastApi(nonce?: string): Promise<number>;
    RelaxApi(nonce?: string): Promise<number>;
    /**
     *
     * @param fileUrl http or local file path
     * @returns
     */
    UploadImage(fileUrl: string): Promise<DiscordImage>;
    /**
     * prepare an attachement to upload an image.
     */
    private attachments;
    private uploadImage;
    DescribeApi(image: DiscordImage, nonce?: string): Promise<number>;
}
