# Storage Layout Fetcher

[![npm version](https://badge.fury.io/js/storage-layout-fetcher.svg)](https://badge.fury.io/js/storage-layout-fetcher)
[![Build Status](https://github.com/wmzy/storage-layout-fetcher/actions/workflows/ci.yml/badge.svg)](https://github.com/wmzy/storage-layout-fetcher/actions)
[![Coverage Status](https://coveralls.io/repos/github/wmzy/storage-layout-fetcher/badge.svg?branch=main)](https://coveralls.io/github/wmzy/storage-layout-fetcher?branch=main)

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Description

Storage Layout Fetcher is a lightweight library for fetching storage layouts of verified contracts. 

## Installation

To install Storage Layout Fetcher, use npm or pnpm:

```bash
npm install storage-layout-fetcher
```

or

```bash
pnpm add storage-layout-fetcher
```

## Usage

Here is a basic example of how to use Fetch Fun:

```typescript
import fetchStorageLayout from 'storage-layout-fetcher';

const storageLayout = await fetchStorageLayout('0x06012c8cf97bead5deae237070f9587f8e7a266d', 'mainnet');
```

## How it works

1. fetch source code from explorers.
2. ensure the solc_version is greater than 0.6.8

	if not, modify the solc_version to 0.6.8 and try to modify the contract to be compatible with 0.6.8

3. compile and return the storage layout.

## Contributing

We welcome contributions to Storage Layout Fetcher! If you have any ideas, suggestions, or bug reports, please open an issue on our [GitHub repository](https://github.com/wmzy/storage-layout-fetcher/issues).

To contribute code, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

Please ensure your code adheres to our coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License.
