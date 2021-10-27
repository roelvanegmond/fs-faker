# fs-faker
A command line application that allows you to generate a fake file structure.
## Usage

- Clone this repository
- Browse to the local repository folder
- run `npm install`
- run `node index.js -h`

# Configuration

To change how the file structure is generated, you can change the configuration in the `config` folder.


## dataRoot

Location where the file structure is generated.

Default: `c:/fakeData`

## maxUniqueDirPaths

The maximum number of unique paths to be generated. It uses this unique paths to generate the directory structure recursively.

## maxDepth

The maximum folder depth.

Default: `5`

## maxFileCount

The maximum number of files to be generated.

Default: `500`

## fileSizeMin

The minimum file size in bytes.

Default: `1048576` (1MB)

## fileSizeMax

The minimum file size in bytes.

Default: `10485760` (10MB)

## pathConstructor

[Faker](http://marak.github.io/faker.js/) API methods (using a mustache string format) that can be used to generate folder names.

Default: `10485760` (10MB)