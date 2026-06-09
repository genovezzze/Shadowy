import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProfileView } from "@/components/account/profile-view";

export default async function AdminProfilePage() {
  const session = await requireUser(["ADMIN"]);
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { title: true },
  });

  return (
    <ProfileView
      name={session.name}
      email={session.email}
      role={session.role}
      title={user?.title}
    />
  );
}
