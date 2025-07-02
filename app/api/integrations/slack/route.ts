import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { channel, message, projectName, links } = await req.json()

    // In a real implementation, this would use Slack's Web API
    // For now, we'll simulate the notification
    const slackMessage = {
      channel: channel || "#development",
      text: `🚀 New SDLC project ready: *${projectName}*`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🚀 *${projectName}* documentation is ready!\n\n${message}`,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*JIRA Epic:*\n<${links?.jira || "#"}|${links?.jiraKey || "View Epic"}>`,
            },
            {
              type: "mrkdwn",
              text: `*Confluence:*\n<${links?.confluence || "#"}|View Documentation>`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View Project",
              },
              url: links?.project || "#",
              style: "primary",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "GitHub Repo",
              },
              url: links?.github || "#",
            },
          ],
        },
      ],
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: slackMessage,
      sent_to: channel || "#development",
    })
  } catch (error) {
    console.error("Error sending Slack notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
