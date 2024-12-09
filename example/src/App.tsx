/* eslint-disable ts/no-unsafe-return */
/* eslint-disable ts/no-unsafe-assignment */
import TreeTransfer from '@jeremy-hibiki/tree-transfer';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';
import { Button, Splitter } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import AceEditor from 'react-ace';
import { ErrorBoundary } from 'react-error-boundary';

const DEFAULT_DATA_SOURCE = [
  {
    title: 'CS 大类',
    key: 'cs',
    children: [
      {
        title: 'CS',
        key: 'cs-cs',
      },
      {
        title: 'CS Computer Vision',
        key: 'cs-cs.CV',
      },
      {
        title: 'CS Artificial Intelligence',
        key: 'cs-cs.AI',
      },
      {
        title: 'CS Information Theory',
        key: 'cs-cs.IT',
      },
    ],
  },
  {
    title: 'MATH 大类',
    key: 'math',
    children: [
      {
        title: 'MATH Algebraic Topology',
        key: 'math-math.AT',
      },
      {
        title: 'MATH Algebraic Geometry',
        key: 'math-math.AG',
      },
    ],
  },
];

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
              theme="github"
              value={dataSource}
              onBlur={(e, editor) => {
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
              theme="github"
              value={targetKeys}
              onBlur={(e, editor) => {
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
