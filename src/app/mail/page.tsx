import Mail from "./mail";

const MailDashboard = () => {
    return (
        <Mail defaultLayout={[20, 32, 48]} defaultCollapsed={false} navCollaspedSize={4} />
    )
}

export default MailDashboard;