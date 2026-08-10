const SYSTEM_PROMPT = `You are an AI assistant for Rayhan Bintang Abdurrahim, an AWS-certified infrastructure and platform engineer based in Jakarta, Indonesia (UTC+7), with 5 years of experience. Speak warmly but concisely (2-4 sentences max). Use a touch of dry terminal humor when appropriate.

Profile:
- Currently: Technical Consultant - DevOps Specialist at PT Mitra Integrasi Informatika (Feb 2025 - now). Builds and operates production Kubernetes platforms on AWS: Amazon EKS and its networking, Terraform across multi-account estates, GitLab CI/CD and ArgoCD delivery, and the shared tooling application teams deploy through.
- Previously: System Engineer at PT Mastersystem Infotama (Dec 2021 - Jul 2024); Junior Advisory at Pertamina Training Center (Sep 2020 - Dec 2021).
- Education: BSc Biomedical Engineering, Bandung Institute of Technology (ITB), 2020. Completed Japanese business + technical language training (Jul 2024 - Feb 2025).
- 7 certs: AWS DevOps Engineer Professional, AWS Security Specialty, AWS Solutions Architect Professional, AWS Gen AI Developer Professional, AWS SysOps Administrator Associate, AWS Solutions Architect Associate, RHCSA. All verifiable at credly.com/users/rayhan-abdurrahim/badges.

Flagship work (these numbers are verified; do not round or embellish them):
- Bank BJB, greenfield AWS platform: 3 Amazon EKS clusters on 20 managed nodes from a five-stack Terraform layout using for_each; VPC CNI custom networking on a secondary CIDR with per-AZ ENIConfig, prefix delegation and pod security groups; 64 application repositories onboarded to GitLab CI and Amazon ECR; 63 services healthy under hub-and-spoke ArgoCD; three shared pipeline templates adopted across 59 repositories with every pipeline green; KEDA scaling a WebSocket service on connection count because CPU-based HPA was a poor signal; 99.7% success rate under a 25,000-user load test.
- hibank, GKE to Amazon EKS for a core banking and BNPL platform: 297 manifests across 11 resource kinds rebuilt from live cluster state; a 46-script Python and Bash conversion toolchain; SecretProviderClass to native Secrets, Filestore to EFS CSI, GKE Ingress and BackendConfig to nginx-ingress, NodePort to ClusterIP behind NLB, Artifact Registry to ECR across 65 images; cutover gated behind IP-to-DNS and readiness verification; 6 environments bootstrapped; AWS SSO across 25 accounts and 109 assignments; log analysis moved to S3 and Athena.
- IDSurvey, GitLab platform and CI/CD modernization: self-managed GitLab CE in a private subnet reachable only via SSM, 44 projects across 6 namespaces; deploys refactored from build-on-the-host over SSH to runner-built images in ECR with rollback by commit-SHA tag; 8 Terraform stacks; 4 EKS clusters.
- Indonesia Investment Authority, OCI landing zone: CIS-benchmarked hub-and-spoke in Terraform, 4 compartments, 3 VCNs, DRG; delivered via Resource Manager with plan-on-PR and apply-on-merge; Cloud Guard, Security Zones, Vault.
- Earlier: Artajasa (GKE to EKS), Panin Dai-Ichi Life (on-prem Rancher to ECS), BRI Danareksa (DR site and API Gateway), Telkomsel Virtual Assistant and MePro (OpenShift to EKS, then CloudFront and Redis modernization), Bayan Resources (AWS DR site).
- Side project: youtube-clipper, a Python pipeline that turns long-form video into short-form vertical clips using yt-dlp, faster-whisper, Claude and ffmpeg. He runs the accounts it publishes to.

Skills: Amazon EKS, Terraform, Kubernetes, ArgoCD, GitLab CI/CD, Helm, Kustomize, KEDA, Amazon ECR, Python, Bash, RHEL, CloudWatch/S3/Athena, IAM and IRSA, KMS, Oracle Cloud, AI-assisted engineering.

Honest gaps, admit these plainly if asked rather than bluffing: GitHub Actions (he uses GitLab CI), Datadog and Sentry (he uses CloudWatch, S3 and Athena), Cloudflare (he uses CloudFront), Argo Rollouts, MongoDB, and formal on-call rotation.

- Available for: platform engineering, Kubernetes and cloud migration work, infrastructure consulting, freelance via Contra.
- Contact: rayhanbintang.work@gmail.com, +62 822 1611 5286, github @Rayhanbintang, linkedin /in/rayhanbintang.

If asked about specific rates or timelines, say "depends on scope — drop a note at rayhanbintang.work@gmail.com and we'll align quickly." Never invent facts, metrics or clients not listed above.`;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, conversationHistory } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Check if Ollama is available
  const ollamaAvailable = await checkOllama();
  
  if (ollamaAvailable) {
    // Use AI-powered response
    try {
      const aiReply = await getOllamaResponse(message, conversationHistory || []);
      return res.status(200).json({
        reply: aiReply,
        mode: 'ai-powered',
        model: 'rayhan-assistant'
      });
    } catch (error) {
      // Fallback to rule-based if AI fails
      const reply = getRuleBasedResponse(message);
      return res.status(200).json({
        reply,
        mode: 'rule-based'
      });
    }
  } else {
    // Use rule-based response
    const reply = getRuleBasedResponse(message);
    return res.status(200).json({
      reply,
      mode: 'rule-based'
    });
  }
}

// Check if Ollama is available
async function checkOllama() {
  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Get response from Ollama
async function getOllamaResponse(message, conversationHistory) {
  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
  const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'rayhan-assistant';

  // Build messages array with history (limit to last 10 messages to prevent slowdown)
  const recentHistory = conversationHistory.slice(-10);
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentHistory,
    {
      role: 'user',
      content: message
    }
  ];

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: messages,
      stream: false,
      options: {
        num_ctx: 4096  // Increased for conversation context
      }
    }),
    signal: AbortSignal.timeout(60000) // 60 second timeout for longer conversations
  });

  if (!response.ok) {
    throw new Error('Ollama request failed');
  }

  const data = await response.json();
  return data.message.content;
}

// Fallback used whenever the self-hosted model is unreachable. Every fact here
// must match the site content and the CV — no invented metrics, no tools Rayhan
// does not actually use.
const CONTACT_EMAIL = 'rayhanbintang.work@gmail.com';

function getRuleBasedResponse(message) {
  const msg = message.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|greetings)/.test(msg)) {
    return "Hello. I'm Rayhan's assistant, currently answering from a scripted knowledge base rather than the live model. Ask me about his Kubernetes and AWS work, how he runs migrations, or how to get in touch.";
  }

  // Migrations — checked before the generic Kubernetes branch
  if (/migrat|gke|openshift|rancher|lift.*shift|move.*cloud/.test(msg)) {
    return "Migrations are most of his track record: GKE to Amazon EKS twice (including a core banking and BNPL platform), on-premise OpenShift to EKS for Telkomsel, and on-premise Rancher to Amazon ECS.\n\nHis approach on the largest one: rebuild the workload layer from live cluster state rather than copying the repo, script the conversion so it is repeatable across staging, UAT and production, and gate the cutover behind verification so mismatches surface before the switch. That job was 297 manifests across 11 resource kinds, handled by a 46-script toolchain.\n\nThere's a full write-up on the site under Projects.";
  }

  // Kubernetes / containers
  if (/kubernetes|k8s|eks|docker|container|helm|argo|gitops|keda|autoscal/.test(msg)) {
    return "Production Kubernetes on AWS is the core of what he does:\n\n• 3 Amazon EKS clusters on 20 managed nodes, built from Terraform with for_each\n• VPC CNI custom networking on a secondary CIDR, per-AZ ENIConfig, prefix delegation, pod security groups\n• Hub-and-spoke ArgoCD carrying 63 healthy services, with Kustomize overlays per environment\n• KEDA where CPU is the wrong signal — one WebSocket service scales on connection count instead\n\nHelm for platform components, Kustomize for application overlays.";
  }

  // Terraform / IaC
  if (/terraform|infrastructure.*code|iac|landing zone|state|drift/.test(msg)) {
    return "Terraform-first, across multi-account estates:\n\n• Five-stack layouts driven by for_each, so three clusters are one codebase rather than three copies\n• Reusable modules for onboarding new workloads\n• Landing-zone baselines with CloudTrail, Config, KMS, SSM patching and central backup\n• A CIS-benchmarked hub-and-spoke landing zone on Oracle Cloud, delivered with plan-on-PR and apply-on-merge\n\nWhen the console drifts, he reconciles it back into state until plan reports no changes.";
  }

  // CI/CD
  if (/ci\/?cd|pipeline|gitlab|jenkins|github action|deploy|rollback|runner/.test(msg)) {
    return "GitLab CI, on self-hosted amd64 and Graviton runners, building into Amazon ECR.\n\nThe piece he's proudest of: rather than write 64 pipelines for 64 repositories, he built three shared templates with an opt-in image-bump-and-sync loop. A team turns on the whole delivery path with a single variable. 59 repositories adopted them, every pipeline green.\n\nRollback is by commit-SHA tag. Worth saying plainly — he works in GitLab CI, not GitHub Actions.";
  }

  // AWS / cloud generally
  if (/aws|amazon|cloud|oci|oracle|multi.?cloud/.test(msg)) {
    return "Five years on AWS, mostly for regulated Indonesian clients in banking, telco and energy. Certified at Professional level for DevOps Engineer, Security and Solutions Architect, seven certifications in total.\n\nDay to day that means Amazon EKS and its networking, Terraform across multi-account estates, ECR and GitLab CI for delivery, IAM and IRSA scoped per workload, and CloudWatch with S3 and Athena for logs. He's also built a CIS-benchmarked landing zone on Oracle Cloud, so multi-cloud is real rather than theoretical.";
  }

  // Observability & cost
  if (/monitor|observab|logging|cloudwatch|athena|cost|bill|spend/.test(msg)) {
    return "CloudWatch for the live signal, S3 and Athena for everything older. On one engagement, moving log analysis off hot retention was the single fastest cost reduction available.\n\nHe's also run x86 versus Graviton benchmarks to inform node group sizing. Being straight with you: his observability stack is AWS-native. Datadog and Sentry aren't in his hands-on experience.";
  }

  // Security ("secur" stem so "is it secure?" routes here too)
  if (/secur|compliance|iam|audit|kms|encrypt|least.?privilege/.test(msg)) {
    return "Most of his clients are regulated banks, so the audit trail is part of the design rather than bolted on afterwards:\n\n• IAM and IRSA scoped per workload, no borrowed node roles\n• KMS encryption, CloudTrail and AWS Config baselines\n• Private instances reachable only through SSM, no bastion hosts sitting exposed\n• Cloud Guard, Security Zones and Vault on the Oracle Cloud side\n\nAWS Certified Security – Specialty.";
  }

  // Services
  if (/service|offer|help with|what.*do you do/.test(msg)) {
    return "Broadly:\n\n• Platform engineering — building the Kubernetes and delivery layer application teams ship through\n• Cloud migration — GKE, OpenShift or on-premise onto AWS\n• Terraform and landing zones across multi-account estates\n• CI/CD and GitOps, including shared tooling so teams don't each write their own\n• Cost and observability work on AWS-native tooling\n\nScope shapes the engagement. Email " + CONTACT_EMAIL + " and he'll come back quickly.";
  }

  // Pricing / rates
  if (/price|cost|rate|fee|charge|budget|quote/.test(msg)) {
    return "Rates depend on scope, duration and how much of the estate is in play — a discovery engagement and a full platform build aren't the same conversation.\n\nDrop a note at " + CONTACT_EMAIL + " with what you're trying to do and he'll come back with something concrete rather than a range that fits nobody.";
  }

  // Engagement model — one of the quick-question buttons on the site
  if (/engagement|how do you work|ways of working|process|typical|onboard|remote|timezone|time zone/.test(msg)) {
    return "Usually one of three shapes: a short discovery and architecture review, a build engagement where he stands the platform up end to end, or an embedded stretch alongside an existing team.\n\nHe works remotely from Jakarta on UTC+7, which gives a full working-day overlap with Asia and a solid afternoon overlap with Europe. Async by default, written handovers, and the infrastructure left in Terraform rather than in someone's head.\n\nTell him the scope at " + CONTACT_EMAIL + " and he'll suggest which one fits.";
  }

  // Availability
  if (/available|availability|hire|freelance|contract|when can/.test(msg)) {
    return "He's open to platform engineering, Kubernetes and cloud migration work, and takes freelance through Contra. He's based in Jakarta on UTC+7, which overlaps comfortably with European working hours.\n\nEmail " + CONTACT_EMAIL + " — that's the fastest path.";
  }

  // Contact
  if (/contact|email|reach|get in touch|linkedin|github/.test(msg)) {
    return "Reach him at:\n\n• Email: " + CONTACT_EMAIL + "\n• GitHub: github.com/Rayhanbintang\n• LinkedIn: linkedin.com/in/rayhanbintang\n• Contra: @rayhan_abdurrahim\n\nCertifications are verifiable at credly.com/users/rayhan-abdurrahim/badges.";
  }

  // Side project — checked before the client-work branch, since "side project"
  // contains "project" and would otherwise be swallowed by it.
  if (/side.?(project|gig)|hobby|personal|clipper|youtube|tiktok|video|content creat/.test(msg)) {
    return "He runs youtube-clipper, a Python pipeline that turns long-form video into short-form vertical clips with per-platform upload copy. yt-dlp for source, faster-whisper for word-level transcription, Claude for segment ranking and copywriting, then ffmpeg and mediapipe for face-tracked reframing and captions.\n\nHe also runs the accounts it publishes to, so he owns the distribution side rather than just the tooling.";
  }

  // Projects / case studies
  if (/project|portfolio|work|example|case study|client|reference/.test(msg)) {
    return "Four platforms worth reading about:\n\n• Bank BJB — greenfield AWS: 3 EKS clusters, 64 repositories onboarded, 63 services healthy on ArgoCD, 59 pipelines on shared templates\n• hibank — GKE to EKS for a core banking and BNPL platform: 297 manifests rebuilt behind a 46-script toolchain\n• IDSurvey — self-managed GitLab and CI/CD modernization: 44 projects, 8 Terraform stacks\n• Indonesia Investment Authority — CIS-benchmarked OCI landing zone\n\nThere are full case studies on the site for the first two.";
  }

  // Experience / background
  if (/experience|background|years|career|about/.test(msg)) {
    return "Five years, all of it consulting for enterprise clients in Indonesia. Currently at PT Mitra Integrasi Informatika since Feb 2025, before that System Engineer at PT Mastersystem Infotama for two and a half years.\n\nHe started in biomedical engineering at ITB and ended up in infrastructure. Seven AWS and Red Hat certifications, including three at Professional or Specialty level.";
  }

  // Default
  return "I can tell you about:\n\n• Kubernetes and AWS platform work — EKS, Terraform, ArgoCD\n• How he runs cloud migrations, and what the case studies cover\n• CI/CD, GitOps and the shared tooling side\n• Availability, engagement models and how to reach him\n\nWhat would be useful?";
}
