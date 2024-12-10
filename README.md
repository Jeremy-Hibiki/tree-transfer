# An `TreeTransfer` component based on ant.design [^antd]

Implementation of the `TreeTransfer` component with `ant.design` [^antd] `Tree` and `Transfer` components.

The `TreeTransfer` component is a combination of the `Tree` and `Transfer` components, which allows you to transfer nodes between two trees.

The code is based on https://github.com/ant-design/ant-design/issues/46706, and modified to TypeScript and fixed some bugs.

## Installation

```bash
pnpm add @jeremy-hibiki/tree-transfer
```

or

```bash
npm install @jeremy-hibiki/tree-transfer
```

or

```bash
yarn add @jeremy-hibiki/tree-transfer
```

## Usage

- Check the [example](./example) directory for more details.

## Limitations

- Only supports "two-level" trees, meaning the tree can only have two levels of nodes: a parent level and a children level.
- Missing unit tests and e2e tests.

[^antd]: https://ant.design/
