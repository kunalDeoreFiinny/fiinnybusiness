// Is file mein hum Upar wali file (FriendDetails) ko import kar rahe hain
import FriendDetails from "./FriendDetails";

// ⚠️ YEH FUNCTION ERROR FIX KAREGA
export async function generateStaticParams() {
    return [
        { friendId: "1" },
        { friendId: "2" },
        { friendId: "3" },
    ];
}

export default function Page() {
    return <FriendDetails />;
}