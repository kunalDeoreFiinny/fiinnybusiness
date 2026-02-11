import GroupDetails from "./GroupDetails";

// ✅ ERROR FIX: Yeh function Next.js ko IDs batata hai
export async function generateStaticParams() {
    return [
        { groupId: "1" },
        { groupId: "2" },
        { groupId: "3" },
    ];
}

export default function Page() {
    return <GroupDetails />;
}