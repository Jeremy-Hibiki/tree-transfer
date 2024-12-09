/* eslint-disable ts/no-unsafe-return */
/* eslint-disable ts/no-unsafe-assignment */
import type { TreeTransferDataNode } from '@jeremy-hibiki/tree-transfer';

import TreeTransfer, { DEFAULT_KEY_SEPARATOR } from '@jeremy-hibiki/tree-transfer';
import ace from 'ace-builds/src-noconflict/ace';
import jsonWorkerUrl from 'ace-builds/src-noconflict/worker-json?url';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';
import { Button, Splitter } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import AceEditor from 'react-ace';
import { ErrorBoundary } from 'react-error-boundary';

// eslint-disable-next-line ts/no-unsafe-call, ts/no-unsafe-member-access
ace.config.setModuleUrl('ace/mode/json_worker', jsonWorkerUrl);

const DEFAULT_DATA_SOURCE_ORIG = [
  {
    title: 'CS 大类',
    key: 'cs',
    children: [
      {
        title: 'CS',
        key: 'cs',
      },
      {
        title: 'CS Computer Vision',
        key: 'cs.CV',
      },
      {
        title: 'CS Artificial Intelligence',
        key: 'cs.AI',
      },
      {
        title: 'CS Information Theory',
        key: 'cs.IT',
      },
    ],
  },
  {
    title: 'MATH 大类',
    key: 'math',
    children: [
      {
        title: 'MATH Algebraic Topology',
        key: 'math.AT',
      },
      {
        title: 'MATH Algebraic Geometry',
        key: 'math.AG',
      },
    ],
  },
] as TreeTransferDataNode[];

const DEFAULT_DATA_SOURCE = DEFAULT_DATA_SOURCE_ORIG.map((item) => {
  if (!item.children || item.children.length === 0) return item;
  const parentKey = item.key;
  const children = item.children.map((child) => ({
    ...child,
    key: `${parentKey}${DEFAULT_KEY_SEPARATOR}${child.key}`,
  }));
  return {
    ...item,
    children,
  };
});

const DEFAULT_DATA_SOURCE_JSON = JSON.stringify(DEFAULT_DATA_SOURCE, null, 2);

function safeParse(value: string) {
  try {
    return JSON.parse(value.trim());
  } catch (error) {
    return null;
  }
}

function App() {
  const [dataSource, setDataSource] = useState<string>(DEFAULT_DATA_SOURCE_JSON);
  const [targetKeys, setTargetKeys] = useState<string>('[]');
  const [transferred, setTransferred] = useState<any>();

  const dataSourceJson = useMemo(() => safeParse(dataSource), [dataSource]);

  const [key, setKey] = useState(0);
  const remountComponent = useCallback(() => {
    setKey((prevKey) => prevKey + 1);
  }, [setKey]);

  const transferRenderer = useMemo(
    /**
     * Must be memoized to avoid re-rendered from `transferred` changing
     */
    () => {
      const targetKeysJson = safeParse(targetKeys) ?? [];
      return (
        <TreeTransfer
          key={key * 10}
          dataSource={dataSourceJson}
          rootClassName="h-full w-70%"
          targetKeys={targetKeysJson}
          treeProps={{
            titleRender: (node: TreeTransferDataNode) => {
              return <div>{node.isLeaf ? node.title : `${node.title} (${node.children?.length ?? 0})`}</div>;
            },
          }}
          defaultExpandAll
          onChange={(data) => {
            setTransferred(JSON.stringify(data, null, 2));
          }}
        />
      );
    },
    [dataSourceJson, targetKeys, key, setTransferred]
  );

  return (
    <div className="min-h-screen box-border p-16 flex flex-col">
      <div className="flex-1 flex flex-col justify-between gap-16">
        <Splitter className="flex-1 w-full">
          <Splitter.Panel collapsible>
            <h1>Data Source</h1>
            <AceEditor
              className="size-full"
              name="dataSource"
              height="100%"
              mode="json"
              tabSize={2}
              theme="github"
              value={dataSource}
              enableBasicAutocompletion
              onBlur={(_, editor) => {
                setDataSource(editor!.getValue());
              }}
            />
          </Splitter.Panel>
          <Splitter.Panel collapsible>
            <h1>Initial Target Keys</h1>
            <AceEditor
              className="size-full"
              name="targetKeys"
              height="100%"
              mode="json"
              tabSize={2}
              theme="github"
              value={targetKeys}
              enableBasicAutocompletion
              onBlur={(_, editor) => {
                setTargetKeys(editor?.getValue() ?? '');
              }}
            />
          </Splitter.Panel>
          <Splitter.Panel collapsible>
            <h1>Transferred Data</h1>
            <AceEditor
              className="size-full"
              name="transferredData"
              height="100%"
              mode="json"
              tabSize={2}
              theme="github"
              value={transferred ?? '[]'}
              readOnly
            />
          </Splitter.Panel>
        </Splitter>
        <div className="flex-[2] flex gap-8 h-full">
          <ErrorBoundary key={key} fallback={<div>Error</div>}>
            {transferRenderer}
          </ErrorBoundary>
          <Button onClick={remountComponent}>Remount</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
