import { useState, useRef, useCallback } from 'react';

interface UseClipboardConfig {
  columns: string[];
  headers: string[];
  parseRow: (values: string[]) => Record<string, unknown> | null;
  onInsert: (record: Record<string, unknown>) => Promise<boolean>;
  onComplete: () => void;
  getData: () => Record<string, unknown>[];
}

export function useClipboard({
  columns,
  headers,
  parseRow,
  onInsert,
  onComplete,
  getData,
}: UseClipboardConfig) {
  const [copyStatus, setCopyStatus] = useState('');
  const [pasteStatus, setPasteStatus] = useState('');
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pasteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setTimedStatus = (
    setter: (s: string) => void,
    timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
    message: string,
  ) => {
    setter(message);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setter(''), 3000);
  };

  const handleCopy = useCallback(async () => {
    try {
      const data = getData();
      const headerRow = headers.join('\t');
      const rows = data.map(record =>
        columns.map(key => {
          const value = record[key];
          return value === null || value === undefined ? '' : value;
        }).join('\t')
      ).join('\n');
      await navigator.clipboard.writeText(headerRow + '\n' + rows);
      setTimedStatus(setCopyStatus, copyTimerRef, 'Copied ' + data.length + ' records!');
    } catch (err: unknown) {
      setTimedStatus(setCopyStatus, copyTimerRef, 'Copy failed: ' + (err as Error).message);
    }
  }, [columns, headers, getData]);

  const handlePaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const lines = clipboardText.trim().split('\n');
      if (lines.length < 2) {
        setTimedStatus(setPasteStatus, pasteTimerRef, 'No data found in clipboard');
        return;
      }
      const dataRows = lines.slice(1);
      let addedCount = 0;
      for (const row of dataRows) {
        const values = row.split('\t');
        const record = parseRow(values);
        if (record) {
          const success = await onInsert(record);
          if (success) addedCount++;
        }
      }
      setTimedStatus(setPasteStatus, pasteTimerRef, 'Added ' + addedCount + ' records!');
      onComplete();
    } catch (err: unknown) {
      setTimedStatus(setPasteStatus, pasteTimerRef, 'Paste failed: ' + (err as Error).message);
    }
  }, [parseRow, onInsert, onComplete]);

  return { copyStatus, pasteStatus, handleCopy, handlePaste };
}
