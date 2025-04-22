#!/usr/bin/env node

import "reflect-metadata";
import fs from "fs";
import log from "loglevel";
import path from "path";
import { program } from "commander";

import {
    NetrunnerDataSource, NetrunnerDataSourceOptions, PrintingEntity
} from "@eric03742/netrunner-entities";

interface AppOptions extends NetrunnerDataSourceOptions {
    output: string;
}

const IMAGE_SIZE = [
    "tiny", "small", "medium", "large",
];
const IMAGE_URL = "https://card-images.netrunnerdb.com/v2";

let exist_count = 0;
let download_count = 0;
let failed_count = 0;

program
    .version("0.3.0", "-v, --version", "显示程序版本")
    .requiredOption("--host <host>", "数据库地址")
    .requiredOption("--port <port>", "端口", parseInt)
    .requiredOption("--username <username>", "用户名")
    .requiredOption("--password <password>", "密码")
    .requiredOption("--database <database>", "数据库名")
    .requiredOption("--output <output>", "导出目录")
    ;
program.parse();
const options = program.opts<AppOptions>();
const AppDataSource = new NetrunnerDataSource(options);

async function initialize(): Promise<void> {
    log.setLevel(log.levels.INFO);
    await AppDataSource.initialize();
    log.info(`MySQL server '${options.host}:${options.port}', database '${options.database}' connected!`);
    if(!fs.existsSync(options.output) || !fs.lstatSync(options.output).isDirectory()) {
        throw new Error(`Output directory '${options.output}' not found!`);
    }

    for(const size of IMAGE_SIZE) {
        const subfolder = path.join(options.output, size);
        if(!fs.existsSync(subfolder)) {
            fs.mkdirSync(subfolder);
        }
    }

    exist_count = 0;
    download_count = 0;
    failed_count = 0;
}

async function terminate(): Promise<void> {
    await AppDataSource.destroy();
}

function sleep(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function download(codename: string, face: number = -1): Promise<void> {
    const filename = (face >= 0) ? `${codename}-${face}.jpg` : `${codename}.jpg`;
    for(const size of IMAGE_SIZE) {
        const url =`${IMAGE_URL}/${size}/${filename}`;
        const address = path.join(options.output, size, filename);
        if(fs.existsSync(address)) {
            exist_count += 1;
            continue;
        }

        const result = await fetch(url);
        if(result.ok) {
            const buffer = await result.bytes();
            fs.writeFileSync(address, buffer);
            await sleep(100);
            log.info(`Picture: ${size}/${filename} downloaded!`);
            download_count += 1;
        } else {
            log.error(`Failed to download: ${size}/${filename}!`);
            failed_count += 1;
        }
    }
}

async function extract(): Promise<void> {
    const repository = AppDataSource.getRepository(PrintingEntity);
    const entries = await repository.find({
        select: ["codename", "extra_face"],
        relations: ["card"],
    });
    for(const e of entries) {
        await download(e.codename);
        if(e.extra_face > 0) {
            for(let i = 0; i < e.extra_face; ++i) {
                await download(e.codename, i);
            }
        } else if(e.card.extra_face > 0) {
            for(let i = 0; i < e.card.extra_face; ++i) {
                await download(e.codename, i);
            }
        }
    }

    log.info(`Total: ${exist_count} Skipped, ${download_count} Downloaded, ${failed_count} Failed!`);
}

async function main(): Promise<void> {
    await initialize();
    await extract();
}

main()
    .then(() => {
        log.info("Finished!");
    })
    .catch((err: Error) => {
        log.error("Failed with error: " + err.message);
        log.error("Stacktrace: " + err.stack);
    })
    .finally(async () => {
        await terminate();
    });
