/**
 * @see https://github.com/ant-design/ant-design/issues/46706
 * @see https://codesandbox.io/p/sandbox/shu-chuan-suo-kuang-sou-suo-23xpvr
 */

import { Transfer, Tree } from 'antd';
import { difference } from 'lodash-es';
import { useEffect, useState } from 'react';

import type { HandleCheckboxSelectedCb, SelectAllLabelCb, TreeTransferDataNode, TreeTransferProps } from './types';

import { DEFAULT_KEY_SEPARATOR } from './types';

const fieldNames = {
  title: 'title',
  key: 'key',
  children: 'children',
};

// Alias for convenience
type TTDN = TreeTransferDataNode;
const DEFAULT_DATA_SOURCE: TTDN[] = [];
const DEFAULT_TARGET_KEYS: string[] = [];

const TreeTransfer = ({
  dataSource = DEFAULT_DATA_SOURCE,
  targetKeys: targetKeysProp = DEFAULT_TARGET_KEYS,
  defaultExpandAll = true,
  treeHeight,
  keySeparator = DEFAULT_KEY_SEPARATOR,
  onChange,
  ...restProps
}: TreeTransferProps) => {
  const [transferDataSource, setTransferDataSource] = useState<TTDN[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [rightTreeData, setRightTreeData] = useState<TTDN[]>([]);
  const [leftSearchVal, setLeftSearchVal] = useState('');
  const [rightSearchVal, setRightSearchVal] = useState('');
  const [leftTreeFiltered, setLeftTreeFiltered] = useState<TTDN[]>([]);
  const [rightTreeFiltered, setRightTreeFiltered] = useState<TTDN[]>([]);
  const [rightCheckedKeys, setRightCheckedKeys] = useState<string[]>([]);

  useEffect(() => {
    const handleTransferDataSource = () => {
      const transferData: TTDN[] = [];
      function flatten(list: TTDN[] = []) {
        list.forEach((item) => {
          item.key = String(item.key);
          transferData.push(item);
          flatten(item.children);
        });
      }
      flatten(dataSource);
      setTransferDataSource(transferData);
    };

    const handleInitialRightTreeData = () => {
      const regionIds = Array.from(new Set(targetKeysProp.map((unionKey) => unionKey.split(keySeparator, 2)[0])));
      const remainRegions = dataSource.filter((item) => regionIds.includes(item.key));
      const rightTree = remainRegions.map((item) => {
        const { children, ...rest } = item;
        const selectedChildren = children?.filter((child) => targetKeysProp.includes(child.key));
        return {
          ...rest,
          children: selectedChildren,
        };
      });

      setRightTreeData(rightTree);
    };

    setTargetKeys(targetKeysProp);
    setLeftTreeFiltered([...dataSource]);
    handleTransferDataSource();
    handleInitialRightTreeData();
  }, [dataSource, keySeparator, targetKeysProp]);

  const generateTreeMarkDisabled = (treeNodes: TTDN[] = [], checkedKeys: string[] = []): TTDN[] => {
    return treeNodes.map(({ children, key, title }) => ({
      key,
      title,
      disabled: children
        ? checkedKeys.some((checkedKey) => checkedKey.split(keySeparator, 2)[0] === key)
        : checkedKeys.includes(key),
      children: generateTreeMarkDisabled(children, checkedKeys),
    }));
  };

  const dealCheckboxSelected: HandleCheckboxSelectedCb = ({ info, checkedKeys, onItemSelect, onItemSelectAll }) => {
    const {
      checked,
      halfCheckedKeys = [],
      node: { key, children },
    } = info;

    if (children && children.length > 0) {
      // 勾选的是父节点
      const keys = children.map((child) => child.key);
      onItemSelectAll([...keys, key], checked);
    } else {
      if (!checked) {
        const parentKey = halfCheckedKeys[0] ?? key.split(keySeparator, 2)[0];
        onItemSelectAll([parentKey as string, key], checked);
      } else {
        const currentItemTree = leftTreeFiltered.filter((item) => item.key === key.split(keySeparator, 2)[0])[0];
        const parentKey = key.split(keySeparator, 2)[0];
        const currentItemTreeSelectedKeys = checkedKeys.filter((key) =>
          key.split(keySeparator, 2)[0].includes(parentKey)
        );

        if (
          !halfCheckedKeys?.includes(parentKey) &&
          currentItemTree?.children?.length === currentItemTreeSelectedKeys.length
        ) {
          onItemSelectAll([key, parentKey], checked);
        } else {
          onItemSelect(key, checked);
        }
      }
    }
  };

  const toGetRightTreeData = (keys: string[], moveTo: 'left' | 'right') => {
    let rightDataArr = [...rightTreeData];
    keys.forEach((key) => {
      dataSource.forEach((data) => {
        if (key === data.key) {
          // 勾选的是父节点,查看右侧是否有勾选对象
          const index = rightDataArr.findIndex((i) => {
            return i.key === key;
          });
          // TODO: 判断当前是否有筛选
          if (moveTo === 'right') {
            if (index === -1) {
              rightDataArr.push(data);
            } else if (index > -1 && (rightDataArr[index]?.children?.length ?? 0) < (data?.children?.length ?? 0)) {
              // 先选择子项再勾选该父级时，传过来的keys是 ['0-1-0','0-1'],此时第一次循环已经将该父级放到arr中，
              // 再遍历0-1时，需要先删除再将全部的children复制
              rightDataArr.splice(index, 1);
              rightDataArr.push(data);
            }
          } else {
            if (index > -1) {
              rightDataArr.splice(index, 1);
            }
          }
        } else {
          // 勾选的是子节点
          // 左侧数据处理
          let selectedParentKey = ''; //选定的父项id
          let selectedObj = {} as TTDN; //选定对象
          if (data?.children?.length ?? 0) {
            data.children?.forEach((child) => {
              if (key === child.key) {
                selectedParentKey = data.key;
                selectedObj = child;
              }
            });
          }
          // 右侧数据处理
          if (Object.keys(selectedObj)?.length > 0) {
            let newData;
            // 查看右侧是否有选中子项的父项
            const index = rightDataArr.findIndex((item) => {
              return item.key === selectedParentKey;
            });
            if (index > -1) {
              // 右侧已有选中子项的父项，selectedIndex查看右侧子项是否有勾选对象
              const oldChildArr = [...(rightDataArr[index].children ?? [])];
              const selectedIndex = oldChildArr?.findIndex((o) => {
                return o.key === selectedObj.key;
              });
              if (selectedIndex === -1 && moveTo === 'right') {
                rightDataArr[index].children?.push(selectedObj);
              }
              if (selectedIndex > -1 && moveTo === 'left') {
                rightDataArr[index].children?.splice(selectedIndex, 1);
                if (rightDataArr[index].children?.length === 0) {
                  rightDataArr.splice(index, 1);
                }
              }
            } else {
              // 右侧没有选中子项的父项
              if (moveTo === 'right') {
                newData = { ...data };
                newData.children = [];
                newData.children.push(selectedObj);
                rightDataArr.push(newData);
              } else if (moveTo === 'left') {
                rightDataArr = [];
              }
            }
          }
        }
      });
    });
    return rightDataArr;
  };

  const getValidTargetKeysWhenReduceSearch = (filteredTree: TTDN[]) => {
    const parentKeys = targetKeys.filter((key) => !key.split(keySeparator, 2)[1]);
    const validParentKeys = parentKeys.filter((parentKey) => {
      const targetItemChildKeys = targetKeys.filter(
        (key) => key.split(keySeparator, 2)[1] && key.split(keySeparator, 2)[0] === parentKey
      );
      const itemLeftTree = filteredTree.find((item) => item.key === parentKey);
      return itemLeftTree?.children?.length === targetItemChildKeys.length;
    });
    const validTargetKeys = [...difference(targetKeys, parentKeys), ...validParentKeys];
    return validTargetKeys;
  };

  const getFilteredTree = (data: TTDN[], searchValIgnoreCase: string) => {
    return data
      .map((item) => {
        if (item.title.toLowerCase().includes(searchValIgnoreCase)) {
          return item;
        }
        item = { ...item };
        if (item.children) {
          item.children = item.children?.filter((res) => res.title.toLowerCase().includes(searchValIgnoreCase));
        }
        return item;
      })
      .filter((item) => {
        if ((item.children?.length ?? 0) || !searchValIgnoreCase) return true;
        return item.title.toLowerCase().includes(searchValIgnoreCase);
      });
  };

  const handleSearch = (dir: 'left' | 'right', val: string) => {
    const valIgnoreCase = val.trim().toLowerCase();
    if (dir === 'left') {
      setLeftSearchVal(valIgnoreCase);
    } else {
      setRightSearchVal(valIgnoreCase);
    }
    const data = dir === 'left' ? dataSource : rightTreeData;
    const filteredTree = getFilteredTree(data, valIgnoreCase);
    if (dir === 'left') {
      setLeftTreeFiltered(filteredTree);
      // TODO: 增加搜索条件的时候， 处理realTargetKeys
      const validTargetKeys =
        valIgnoreCase.length < leftSearchVal.length ? getValidTargetKeysWhenReduceSearch(filteredTree) : targetKeys;
      setTargetKeys(validTargetKeys);
    }
    if (dir === 'right') {
      setRightTreeFiltered(filteredTree);
    }
  };

  const handleTransfer = (keys: string[], moveTo: 'left' | 'right', moveKeys: string[]) => {
    let rightData: TTDN[];
    if (moveTo === 'right') {
      setTargetKeys(keys);
      rightData = toGetRightTreeData(keys, moveTo);
    } else {
      setRightCheckedKeys([]);
      const invalidParentKeys = Array.from(new Set(moveKeys.map((key) => key.split(keySeparator, 2)[0])));
      setTargetKeys(difference(keys, invalidParentKeys));
      rightData = toGetRightTreeData(moveKeys, moveTo);
    }
    setRightTreeFiltered(getFilteredTree(rightData, rightSearchVal));
    setRightTreeData(rightData);
    onChange?.(rightData);
  };

  const handleLeftHeadCountLabel: SelectAllLabelCb = (info) => {
    const { selectedCount } = info;
    return (
      <span key="left">
        {(selectedCount > 0 || targetKeys.length > 0) && <span>{selectedCount + Number(targetKeys.length)}/</span>}
        <span>{transferDataSource.length}</span> items
      </span>
    );
  };

  const handleRightHeadCountLabel: SelectAllLabelCb = () => {
    const flattenTree = [];
    rightTreeData.forEach((item) => {
      flattenTree.push(item.key);
      if (item.children) {
        flattenTree.push(...item.children);
      }
    });
    return (
      <span key="right">
        <span>{rightCheckedKeys.length}/</span>
        <span>{flattenTree.length}</span> items
      </span>
    );
  };

  if (dataSource.length === 0) return null;

  return (
    <Transfer<TTDN>
      {...restProps}
      dataSource={transferDataSource}
      filterOption={(input, item) => item.title.toLowerCase().includes(input.trim().toLowerCase())}
      render={(item) => item.title}
      rowKey={(record) => record.key}
      selectAllLabels={[handleLeftHeadCountLabel, handleRightHeadCountLabel]}
      targetKeys={targetKeys}
      // @ts-expect-error narrow Key type
      onChange={handleTransfer}
      onSearch={handleSearch}
    >
      {({ direction, onItemSelect, onItemSelectAll, selectedKeys }) => {
        if (direction === 'left') {
          const checkedKeys = [...selectedKeys, ...targetKeys];
          return (
            <Tree
              checkedKeys={checkedKeys}
              defaultExpandAll={defaultExpandAll}
              fieldNames={fieldNames}
              height={treeHeight}
              selectable={false}
              treeData={generateTreeMarkDisabled(leftTreeFiltered, targetKeys)}
              blockNode
              checkable
              onCheck={(checkedKeys, info) => {
                dealCheckboxSelected({
                  info,
                  checkedKeys: checkedKeys as string[],
                  onItemSelect,
                  onItemSelectAll,
                });
              }}
            />
          );
        }
        if (direction === 'right') {
          return (
            <Tree
              checkedKeys={[...selectedKeys]}
              defaultExpandAll={defaultExpandAll}
              fieldNames={fieldNames}
              height={treeHeight}
              selectable={false}
              treeData={rightSearchVal ? rightTreeFiltered : rightTreeData}
              blockNode
              checkable
              onCheck={(checkedKeys, info) => {
                setRightCheckedKeys(checkedKeys as string[]);
                dealCheckboxSelected({
                  info,
                  checkedKeys: checkedKeys as string[],
                  onItemSelect,
                  onItemSelectAll,
                });
              }}
            />
          );
        }
      }}
    </Transfer>
  );
};

export default TreeTransfer;
