import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleTrigger(request);
}

export async function POST(request: NextRequest) {
  return handleTrigger(request);
}

async function handleTrigger(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret') || request.headers.get('authorization')?.replace('Bearer ', '');
  const expectedSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is defined in env, verify it
  if (expectedSecret && secret && secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const githubToken = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_OWNER || 'muneeb1097m';
  const repoName = process.env.GITHUB_REPO || 'Quik-website';
  const workflowName = 'news-cron.yml';

  if (!githubToken) {
    return NextResponse.json(
      {
        success: false,
        message: 'GITHUB_PAT or GITHUB_TOKEN is not set in environment variables. Please add a GitHub Personal Access Token (classic: repo or fine-grained: Actions Write) to your Vercel Environment Variables as GITHUB_PAT.',
      },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/${workflowName}/dispatches`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${githubToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'QuikNews-Cron-Trigger',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        {
          success: false,
          status: res.status,
          error: errorText,
        },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'GitHub Actions news ingestion workflow triggered successfully!',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unknown error triggering GitHub Actions',
      },
      { status: 500 }
    );
  }
}
