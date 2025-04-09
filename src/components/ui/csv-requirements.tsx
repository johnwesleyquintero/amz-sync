import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Info } from 'lucide-react';
import SampleCsvButton from '../amazon-seller-tools/sample-csv-button';

type CsvRequirementsProps = {
  requiredColumns: string[];
  optionalColumns?: string[];
  maxFileSize?: string;
};

export function CsvRequirements({
  requiredColumns,
  optionalColumns = [],
  maxFileSize = '5MB',
}: CsvRequirementsProps) {
  return (
    <Card className="mt-4 border-dashed border-2 border-muted">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-primary" />
          CSV Format Requirements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label className="font-semibold">File Requirements:</Label>
          <ul className="list-disc pl-6 text-sm">
            <li>Maximum file size: {maxFileSize}</li>
            <li>UTF-8 encoding</li>
            <li>First row must be headers</li>
          </ul>
        </div>

        <div className="space-y-1">
          <Label className="font-semibold">Required Columns:</Label>
          <ul className="list-disc pl-6 text-sm">
            {requiredColumns.map(col => (
              <li key={col} className="font-mono">
                {col}
              </li>
            ))}
          </ul>
        </div>

        {optionalColumns.length > 0 && (
          <div className="space-y-1">
            <Label className="font-semibold">Optional Columns:</Label>
            <ul className="list-disc pl-6 text-sm">
              {optionalColumns.map(col => (
                <li key={col} className="font-mono">
                  {col}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4">
          <SampleCsvButton variant="outline" />
        </div>
      </CardContent>
    </Card>
  );
}
