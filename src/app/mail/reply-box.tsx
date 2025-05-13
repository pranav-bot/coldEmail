'use client'
import { api, type RouterOutputs } from "@/trpc/react"
import EmailEditor from "./email-editor"
import useThreads from "@/hooks/use-threads"
import { use, useEffect, useState } from "react"
import { toast } from "sonner"

const ReplyBox = () => {
  const {threadId, accountId} = useThreads()
  const {data: replyDetails} = api.account.getReplyDetails.useQuery({
    threadId: threadId ?? "",
    accountId: accountId??""
  })

  if (!replyDetails) return null

  return <Component replyDetails={replyDetails} />

}

const Component = ({replyDetails}: {replyDetails: RouterOutputs['account']['getReplyDetails']}) => {
  const {threadId, accountId} = useThreads()
  const [subject, setSubject] = useState(replyDetails.subject.startsWith("Re:") ? replyDetails.subject : `Re: ${replyDetails.subject}`)
  const [toValues, setToValues] = useState<{label: string; value: string}[]>(replyDetails.to.map(to => ({
    label: to.address, // Provide a fallback value for null
    value: to.address,
  })))
  const [ccValues, setCcValues] = useState<{label: string; value: string}[]>(replyDetails.cc.map(cc => ({
    label: cc.address, // Provide a fallback value for null
    value: cc.address,
  })))
  useEffect(() => {
    if (!threadId || !replyDetails) return

    if (!replyDetails.subject.startsWith("Re:")){
      setSubject(`Re: ${replyDetails.subject}`)
    }

    setToValues(replyDetails.to.map(to => ({
      label: to.address, // Provide a fallback value for null 
      value: to.address,
    })))
    setCcValues(replyDetails.cc.map(cc => ({
      label: cc.address, // Provide a fallback value for null
      value: cc.address,
    })))

  }, [threadId, replyDetails])
  const sendEmail = api.account.sendEmail.useMutation()
  const handleSend = async (value: string) => {
    if(!replyDetails) return
    sendEmail.mutate({
      accountId: accountId ?? "",
      threadId: threadId ?? "",
      subject,
      body: value,
      from: replyDetails.from,
      to: replyDetails.to.map(to => ({address: to.address, name: to.name??""})),
      cc: replyDetails.cc.map(cc => ({address: cc.address, name: cc.name??""})),
      replyTo: replyDetails.from,
      inReplyTo: replyDetails.id,
    }, {
      onSuccess: () => {
        toast.success("Email sent successfully")
      },
      onError: (error) => {
        console.error("Error sending email: ", error)
        toast.error("Error sending email")
      }
    })
  }
    return (
    <div className="flex flex-col gap-2">
        <EmailEditor
        subject={subject}
        setSubject={setSubject}
        toValues={toValues}
        setToValues={setToValues}
        ccValues={ccValues}
        setCcValues={setCcValues}
        to={replyDetails.to.map(to => to.address)}
        defaultToolBarExpanded={true}

        isSending={false}
        handleSend={handleSend}

        />
    </div>
  )
}

export default ReplyBox