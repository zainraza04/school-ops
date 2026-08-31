'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { AppSelect } from '@/components/common/AppSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CLASSES, SECTIONS } from '@/lib/constants';
import { MOCK_STAFF } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface ClassItem {
  id: string;
  name: string;
}

interface SectionItem {
  id: string;
  classId: string;
  name: string;
  teacher: string;
  studentCount: number;
}

type DeleteTarget =
  | { type: 'class'; item: ClassItem }
  | { type: 'section'; item: SectionItem };

type SheetMode =
  | { type: 'add-class' }
  | { type: 'edit-class'; item: ClassItem }
  | { type: 'add-section' }
  | { type: 'edit-section'; item: SectionItem };

export default function ClassesPage(): ReactNode {
  const [classes, setClasses] = useState<ClassItem[]>(() =>
    CLASSES.map((c) => ({ id: c.id, name: c.name }))
  );
  const [sections, setSections] = useState<SectionItem[]>(() =>
    SECTIONS.map((s) => ({
      id: s.id,
      classId: s.classId,
      name: s.name,
      teacher: s.teacher,
      studentCount: s.studentCount,
    }))
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(
    CLASSES[0]?.id ?? ''
  );
  const [sheet, setSheet] = useState<SheetMode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [className, setClassName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [sectionTeacher, setSectionTeacher] = useState('');
  const [formError, setFormError] = useState('');

  const teachers = useMemo(
    () => MOCK_STAFF.filter((s) => s.role === 'teacher' && s.status === 'active'),
    []
  );

  const classStats = useMemo(() => {
    return classes.map((cls) => {
      const classSections = sections.filter((s) => s.classId === cls.id);
      return {
        ...cls,
        sectionCount: classSections.length,
        studentCount: classSections.reduce((sum, s) => sum + s.studentCount, 0),
      };
    });
  }, [classes, sections]);

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedSections = sections.filter((s) => s.classId === selectedClassId);

  function openAddClass(): void {
    setClassName('');
    setFormError('');
    setSheet({ type: 'add-class' });
  }

  function openEditClass(item: ClassItem): void {
    setClassName(item.name);
    setFormError('');
    setSheet({ type: 'edit-class', item });
  }

  function openAddSection(): void {
    setSectionName('');
    setSectionTeacher(teachers[0]?.name ?? '');
    setFormError('');
    setSheet({ type: 'add-section' });
  }

  function openEditSection(item: SectionItem): void {
    setSectionName(item.name);
    setSectionTeacher(item.teacher);
    setFormError('');
    setSheet({ type: 'edit-section', item });
  }

  function handleSheetSave(): void {
    if (!sheet) return;

    if (sheet.type === 'add-class' || sheet.type === 'edit-class') {
      if (!className.trim()) {
        setFormError('Class name is required');
        return;
      }
      if (sheet.type === 'add-class') {
        const id = `c-${Date.now()}`;
        setClasses((prev) => [...prev, { id, name: className.trim() }]);
        setSelectedClassId(id);
        toast.success('Class added');
      } else {
        setClasses((prev) =>
          prev.map((c) =>
            c.id === sheet.item.id ? { ...c, name: className.trim() } : c
          )
        );
        toast.success('Class updated');
      }
      setSheet(null);
      return;
    }

    if (!sectionName.trim()) {
      setFormError('Section name is required');
      return;
    }
    if (!sectionTeacher.trim()) {
      setFormError('Teacher is required');
      return;
    }

    if (sheet.type === 'add-section') {
      if (!selectedClassId) return;
      setSections((prev) => [
        ...prev,
        {
          id: `s-${Date.now()}`,
          classId: selectedClassId,
          name: sectionName.trim(),
          teacher: sectionTeacher.trim(),
          studentCount: 0,
        },
      ]);
      toast.success('Section added');
    } else {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sheet.item.id
            ? {
                ...s,
                name: sectionName.trim(),
                teacher: sectionTeacher.trim(),
              }
            : s
        )
      );
      toast.success('Section updated');
    }
    setSheet(null);
  }

  async function handleDeleteConfirm(): Promise<void> {
    if (!deleteTarget) return;
    setConfirmLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    if (deleteTarget.type === 'class') {
      const id = deleteTarget.item.id;
      setClasses((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        setSelectedClassId((current) =>
          current === id ? (remaining[0]?.id ?? '') : current
        );
        return remaining;
      });
      setSections((prev) => prev.filter((s) => s.classId !== id));
      toast.success('Class deleted');
    } else {
      setSections((prev) => prev.filter((s) => s.id !== deleteTarget.item.id));
      toast.success('Section deleted');
    }

    setConfirmLoading(false);
    setDeleteTarget(null);
  }

  const sheetTitle =
    sheet?.type === 'add-class'
      ? 'Add Class'
      : sheet?.type === 'edit-class'
        ? 'Edit Class'
        : sheet?.type === 'add-section'
          ? 'Add Section'
          : sheet?.type === 'edit-section'
            ? 'Edit Section'
            : '';

  const isClassSheet =
    sheet?.type === 'add-class' || sheet?.type === 'edit-class';

  return (
    <div>
      <PageHeader
        title="Classes & Sections"
        subtitle="Organize classes and assign section teachers"
        breadcrumb={['Academics', 'Classes']}
        action={
          <Button onClick={openAddClass}>
            <Plus className="size-4" />
            Add Class
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Classes</h2>
          </div>
          {classStats.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No classes"
                description="Add your first class to get started."
                action={{ label: 'Add Class', onClick: openAddClass }}
              />
            </div>
          ) : (
            <ul className="divide-y">
              {classStats.map((cls) => (
                <li
                  key={cls.id}
                  className={cn(
                    'flex w-full items-start justify-between gap-2 px-4 py-3 transition-colors',
                    selectedClassId === cls.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedClassId(cls.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="text-sm font-medium">{cls.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {cls.sectionCount} section
                      {cls.sectionCount === 1 ? '' : 's'} · {cls.studentCount}{' '}
                      students
                    </p>
                  </button>
                  <div className="flex shrink-0 gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${cls.name}`}
                      onClick={() => openEditClass(cls)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${cls.name}`}
                      onClick={() =>
                        setDeleteTarget({ type: 'class', item: cls })
                      }
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="rounded-lg border bg-card">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {selectedClass
                  ? `Sections — ${selectedClass.name}`
                  : 'Sections'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage sections for the selected class
              </p>
            </div>
            <Button
              size="sm"
              onClick={openAddSection}
              disabled={!selectedClass}
            >
              <Plus className="size-4" />
              Add Section
            </Button>
          </div>

          {!selectedClass ? (
            <div className="p-6">
              <EmptyState
                title="Select a class"
                description="Choose a class from the left to view its sections."
              />
            </div>
          ) : selectedSections.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No sections"
                description={`Add a section to ${selectedClass.name}.`}
                action={{ label: 'Add Section', onClick: openAddSection }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Section</th>
                    <th className="px-4 py-3 font-medium">Teacher</th>
                    <th className="px-4 py-3 font-medium">Students</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSections.map((section) => (
                    <tr key={section.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{section.name}</td>
                      <td className="px-4 py-3">{section.teacher}</td>
                      <td className="px-4 py-3">{section.studentCount}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit section ${section.name}`}
                            onClick={() => openEditSection(section)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete section ${section.name}`}
                            onClick={() =>
                              setDeleteTarget({
                                type: 'section',
                                item: section,
                              })
                            }
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Sheet
        open={Boolean(sheet)}
        onOpenChange={(open) => {
          if (!open) setSheet(null);
        }}
      >
        <SheetContent side="right" className="sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>{sheetTitle}</SheetTitle>
            <SheetDescription>
              {isClassSheet
                ? 'Enter the class name as shown to staff and parents.'
                : 'Assign a section name and class teacher.'}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-4">
            {isClassSheet ? (
              <div className="space-y-1.5">
                <Label htmlFor="class-name">Class name</Label>
                <Input
                  id="class-name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Class 11"
                />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="section-name">Section name</Label>
                  <Input
                    id="section-name"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    placeholder="A"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="section-teacher">Teacher</Label>
                  <AppSelect
                    id="section-teacher"
                    value={sectionTeacher}
                    onValueChange={setSectionTeacher}
                    placeholder="Select teacher"
                    aria-label="Teacher"
                    options={teachers.map((t) => ({
                      value: t.name,
                      label: t.name,
                    }))}
                  />
                </div>
              </>
            )}
            {formError && (
              <p className="text-xs text-destructive">{formError}</p>
            )}
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheet(null)}>
              Cancel
            </Button>
            <Button onClick={handleSheetSave}>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={
          deleteTarget?.type === 'class'
            ? 'Delete class?'
            : 'Delete section?'
        }
        description={
          deleteTarget?.type === 'class'
            ? `This will remove ${deleteTarget.item.name} and all of its sections.`
            : deleteTarget
              ? `This will remove section ${deleteTarget.item.name}.`
              : ''
        }
        confirmLabel="Delete"
        onConfirm={() => {
          void handleDeleteConfirm();
        }}
        isLoading={confirmLoading}
      />
    </div>
  );
}
