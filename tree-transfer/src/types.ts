import type { TreeDataNode as OrigTreeDataNode, TransferProps, TreeProps } from 'antd';

export type TreeTransferDataNode = Omit<OrigTreeDataNode, 'key' | 'title' | 'children'> & {
  key: string;
  title: string;
  children?: TreeTransferDataNode[];
};

type ExtractFunction<T> = T extends (...args: any[]) => any ? T : never;
export type SelectAllLabelCb = ExtractFunction<Required<TransferProps>['selectAllLabels'][number]>;
export type CheckInfo = Parameters<Required<TreeProps<TreeTransferDataNode>>['onCheck']>[1];
export type HandleCheckboxSelectedCb = (args: {
  info: CheckInfo;
  checkedKeys: string[];
  direction: 'left' | 'right';
  onItemSelect: (key: string, checked: boolean) => void;
  onItemSelectAll: (keys: string[], checked: boolean) => void;
}) => void;

export type TreeTransferProps = {
  dataSource?: TreeTransferDataNode[];
  targetKeys?: string[];
  defaultExpandAll?: boolean;
  treeHeight?: number;
  keySeparator?: string;
  onChange?: (data: TreeTransferDataNode[]) => void;

  treeProps?: TreeProps<TreeTransferDataNode>;
} & Omit<TransferProps<TreeTransferDataNode>, 'onChange'>;

export const DEFAULT_KEY_SEPARATOR = '###';
