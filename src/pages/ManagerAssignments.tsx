import { AppLayout } from "@/components/AppLayout";
import { ManagerBranchAssignment } from "@/components/ManagerBranchAssignment";

const ManagerAssignments = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menecer Təyinatları</h1>
          <p className="text-muted-foreground">Bölgə menecerlərinin idarə edilməsi</p>
        </div>
        <ManagerBranchAssignment />
      </div>
    </AppLayout>
  );
};

export default ManagerAssignments;