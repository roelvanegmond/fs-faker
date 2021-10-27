const config = require("config");
const fs = require("fs");
const faker = require("faker");
const fakeFile = require("fake-file-generator");
const progress = require("cli-progress");
const chalk = require("chalk");
const program = require("commander").program;
const prompt = require("prompt");

let directories = [];

program
  .version("1.0.0")
  .option(
    "-d, --delete",
    "delete the data structure before generating a new one"
  );

program.parse(process.argv);

let options = program.opts();

run();

async function run() {
  if (options.delete) {
    prompt.start();

    var schema = {
      properties: {
        delete: {
          message:
            chalk.yellow("About to delete " +
            config.get("dataRoot") +
            " and all it's contents. Continue?"),
          required: true,
        },
      },
    };

    prompt.get(schema, function (err, result) {
      if (result.delete.toLowerCase().trim() == "y") {
        console.log("Deleting " + config.get("dataRoot"));
        fs.rmdirSync(config.get("dataRoot"), { recursive: true });
      }
      else{
          generateAndShowProgress();
      }
    });
  } else {
      generateAndShowProgress();
  }
}

async function generateAndShowProgress() {
  // create a new progress bar instance and use shades_classic theme
  const multibar = new progress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format: "{title} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
    },
    progress.Presets.shades_grey
  );

  // add bars
  const dirBar = multibar.create(config.get("maxUniqueDirPaths"), 0, {
    title: "Creating directories... ",
  });
  const fileBar = multibar.create(config.get("maxFileCount"), 0, {
    title: "Creating files...       ",
  });

  await generateDirectoryStructure(dirBar);
  await generateFiles(fileBar);

  // stop all bars
  multibar.stop();
}

// generate directory paths and create them recursively
async function generateDirectoryStructure(dirBar) {
  let dirCount = 0;
  while (dirCount < config.get("maxUniqueDirPaths")) {
    const directoryPath =
      config.get("dataRoot") +
      faker.fake(
        generateDirectoryPath(
          config.get("pathConstructor"),
          config.get("maxDepth")
        )
      );
    try {
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }
    } catch (e) {
      console.log(chalk.red(e.message));
    }

    directories.push(directoryPath);
    dirCount++;
    dirBar.update(dirCount);
  }
}

// randomly pick a path from the directories create a file
async function generateFiles(fileBar) {
  let fileCount = 0;
  while (fileCount < config.get("maxFileCount")) {
    const fileDirectory = getRandomValueFromArray(directories);
    try {
      await fakeFile.makeFile(
        getRandomSubDirectory(fileDirectory, config.get("dataRoot")) + "/" + faker.system.fileName(),
        getRandomFileSize(config.get("fileSizeMin"), config.get("fileSizeMax"))
      ); // fixed size or in between size
    } catch (e) {
      console.log(chalk.red(e.message));
    }
    fileCount++;
    fileBar.update(fileCount);
  }
}

// get a sub directory from a file path and optionally excluding a part of the path that can be used as a sub directory
function getRandomSubDirectory(directoryPath, pathToExclude) {
  let subDirs = directoryPath.split("/");
  let subDirMin;
  if (pathToExclude) {
    subDirMin = pathToExclude.split("/").length;
  }

  let removedCount = 0;
  let toRemoveCount = (Math.random() * subDirs.length) | 0;

  if (subDirMin && toRemoveCount > subDirMin) {
    toRemoveCount = toRemoveCount - subDirMin;
  }

  while (removedCount < toRemoveCount) {
    subDirs.splice(-1);
    removedCount++;
  }

  let filePath = subDirs.join("/");
  return filePath;
}

function getRandomValueFromArray(array) {
  return array[(Math.random() * array.length) | 0];
}

function generateDirectoryPath(constructor, maxDepth) {
  let depth = 1;
  let path = "/" + getRandomValueFromArray(constructor);
  while (depth < maxDepth) {
    path = path + "/" + getRandomValueFromArray(constructor);
    depth++;
  }
  return path;
}

function getRandomFileSize(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
