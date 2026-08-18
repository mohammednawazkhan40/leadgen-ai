import { useState, useRef, useCallback } from 'react';
import { X, Upload, AlertTriangle, CheckCircle2, ArrowRight, FileText, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface CsvImportModalProps {
  onClose: () => void;
}

type MappedFields = Record<string, string>;

const leadFields = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'company', label: 'Company', required: true },
  { key: 'jobTitle', label: 'Job Title', required: false },
  { key: 'industry', label: 'Industry', required: false },
  { key: 'location', label: 'Location', required: true },
  { key: 'linkedinProfileUrl', label: 'LinkedIn URL', required: false },
  { key: 'description', label: 'Description', required: false },
  { key: 'tags', label: 'Tags', required: false },
];

export default function CsvImportModal({ onClose }: CsvImportModalProps) {
  const { user } = useAuth();
  const { addToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'done'>('upload');
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<MappedFields>({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; duplicates: number; errors: string[] } | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      addToast('error', 'Please upload a CSV file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) {
        addToast('error', 'CSV must have at least a header row and one data row');
        return;
      }
      const parsed = lines.map(line => {
        const cols: string[] = [];
        let current = '';
        let inQuotes = false;
        for (const char of line) {
          if (char === '"') { inQuotes = !inQuotes; }
          else if (char === ',' && !inQuotes) { cols.push(current.trim()); current = ''; }
          else { current += char; }
        }
        cols.push(current.trim());
        return cols;
      });
      setHeaders(parsed[0]);
      setCsvData(parsed.slice(1));

      const autoMapping: MappedFields = {};
      const headerLower = parsed[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      leadFields.forEach(f => {
        const key = f.key.toLowerCase();
        const idx = headerLower.findIndex(h =>
          h === key || h.includes(key) || key.includes(h)
        );
        if (idx >= 0) autoMapping[f.key] = parsed[0][idx];
      });
      setMapping(autoMapping);
      setStep('map');
    };
    reader.readAsText(file);
  }, [addToast]);

  const findDuplicates = async (emails: string[]) => {
    const { data } = await supabase.from('leads').select('email').in('email', emails.filter(Boolean));
    return new Set((data || []).map((r: any) => r.email));
  };

  const handleImport = async () => {
    if (!user) return;
    setImporting(true);
    const errors: string[] = [];
    let imported = 0;
    let duplicates = 0;

    const allEmails = csvData
      .map(row => {
        const emailCol = headers.indexOf(mapping['email'] || '');
        return emailCol >= 0 ? row[emailCol]?.trim().toLowerCase() : '';
      })
      .filter(Boolean);

    const existingEmails = await findDuplicates(allEmails);

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const getField = (key: string) => {
        const col = headers.indexOf(mapping[key] || '');
        return col >= 0 ? row[col]?.trim() || '' : '';
      };

      const firstName = getField('firstName');
      const lastName = getField('lastName');
      const email = getField('email');
      const company = getField('company');
      const location = getField('location');

      if (!firstName || !lastName || !email || !company || !location) {
        errors.push(`Row ${i + 2}: Missing required fields (name, email, company, or location)`);
        continue;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push(`Row ${i + 2}: Invalid email "${email}"`);
        continue;
      }
      if (existingEmails.has(email.toLowerCase())) {
        duplicates++;
        continue;
      }

      const tagsStr = getField('tags');
      const tagsArray = tagsStr ? tagsStr.split(/[,;]/).map(t => t.trim()).filter(Boolean) : [];

      try {
        const { error } = await supabase.from('leads').insert({
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          email: email,
          phone: getField('phone') || null,
          company: company,
          contact_name: `${firstName} ${lastName}`,
          contact_title: getField('jobTitle') || null,
          contact_email: email,
          industry: getField('industry') || null,
          location: location,
          linkedin_profile_url: getField('linkedinProfileUrl') || null,
          description: getField('description') || `Imported from CSV`,
          source: 'csv_import',
          status: 'new',
          ai_category: getField('industry') || 'Imported',
          tags: tagsArray,
          skills: tagsArray,
          posted_date: new Date().toISOString(),
          consent: false,
        });
        if (error) {
          errors.push(`Row ${i + 2}: ${error.message}`);
        } else {
          imported++;
          existingEmails.add(email.toLowerCase());
        }
      } catch (err: any) {
        errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    setImportResult({ imported, duplicates, errors });
    setStep('done');
    setImporting(false);
    if (imported > 0) addToast('success', `Imported ${imported} leads`);
    if (duplicates > 0) addToast('warning', `Skipped ${duplicates} duplicates`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-[8vh] p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#111827] border border-gray-700 rounded-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">Import CSV</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 'upload' ? 'Upload a CSV file with your lead data' :
               step === 'map' ? 'Map CSV columns to lead fields' :
               step === 'preview' ? 'Review before importing' : 'Import complete'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5">
          {/* Step: Upload */}
          {step === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={e => { e.preventDefault(); e.stopPropagation(); const file = e.dataTransfer.files[0]; if (file) { const dt = new DataTransfer(); dt.items.add(file); if (fileInputRef.current) { fileInputRef.current.files = dt.files; fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true })); } } }}
              className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors cursor-pointer"
            >
              <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-white mb-1">Drop a CSV file here or click to browse</p>
              <p className="text-xs text-gray-400">Supports .csv and .txt files with comma-separated values</p>
              <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </div>
          )}

          {/* Step: Map */}
          {step === 'map' && (
            <>
              <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
                <FileText className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300">Found {csvData.length} rows with {headers.length} columns</p>
                  <p className="text-xs text-gray-400 mt-1">Map each CSV column to the corresponding lead field. Required fields are marked with *.</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {leadFields.map(field => (
                  <div key={field.key} className="flex items-center gap-3">
                    <label className="w-40 text-sm text-gray-300 shrink-0">
                      {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    <ArrowRight className="w-4 h-4 text-gray-600 shrink-0" />
                    <select
                      value={mapping[field.key] || ''}
                      onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className={`input-field flex-1 text-sm py-2 ${field.required && !mapping[field.key] ? 'border-amber-500/50' : ''}`}
                    >
                      <option value="">-- Skip --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 justify-end mt-5 pt-4 border-t border-gray-800">
                <button onClick={() => setStep('upload')} className="btn-secondary text-sm">Back</button>
                <button
                  onClick={() => setStep('preview')}
                  disabled={!mapping.firstName || !mapping.lastName || !mapping.email || !mapping.company || !mapping.location}
                  className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-30"
                >
                  Preview ({csvData.length} rows)
                </button>
              </div>
            </>
          )}

          {/* Step: Preview */}
          {step === 'preview' && (
            <>
              <div className="mb-4 overflow-x-auto max-h-[40vh]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="pb-2 pr-3 text-left">#</th>
                      {leadFields.filter(f => mapping[f.key]).map(f => (
                        <th key={f.key} className="pb-2 px-2 text-left">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 10).map((row, i) => {
                      const getField = (key: string) => {
                        const col = headers.indexOf(mapping[key] || '');
                        return col >= 0 ? row[col] : '';
                      };
                      return (
                        <tr key={i} className="border-b border-gray-800/50 text-gray-300">
                          <td className="py-2 pr-3 text-gray-500">{i + 1}</td>
                          {leadFields.filter(f => mapping[f.key]).map(f => (
                            <td key={f.key} className="py-2 px-2 max-w-[120px] truncate">{getField(f.key) || '-'}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {csvData.length > 10 && <p className="text-xs text-gray-500 mt-2">Showing first 10 of {csvData.length} rows</p>}
              </div>
              <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-gray-800">
                <button onClick={() => setStep('map')} className="btn-secondary text-sm">Back</button>
                <button onClick={handleImport} disabled={importing} className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50">
                  {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</> : <><Upload className="w-4 h-4" /> Import {csvData.length} Leads</>}
                </button>
              </div>
            </>
          )}

          {/* Step: Done */}
          {step === 'done' && importResult && (
            <div className="text-center py-4">
              {importResult.imported > 0 && (
                <div className="mb-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-emerald-400">{importResult.imported} leads imported</p>
                </div>
              )}
              {importResult.duplicates > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-300">{importResult.duplicates} duplicates skipped (same email already exists)</p>
                </div>
              )}
              {importResult.errors.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-left">
                  <p className="text-sm text-red-300 mb-2">{importResult.errors.length} errors:</p>
                  <div className="max-h-32 overflow-y-auto text-xs text-gray-400 space-y-0.5">
                    {importResult.errors.map((err, i) => <p key={i}>{err}</p>)}
                  </div>
                </div>
              )}
              <button onClick={onClose} className="btn-primary text-sm mt-2">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
