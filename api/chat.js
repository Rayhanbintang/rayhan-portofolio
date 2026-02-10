export default function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Get rule-based response
  const reply = getRuleBasedResponse(message);

  res.status(200).json({
    reply,
    mode: 'rule-based'
  });
}

function getRuleBasedResponse(message) {
  const msg = message.toLowerCase().trim();
  
  // Greetings
  if (/^(hi|hello|hey|greetings)/.test(msg)) {
    return "Hello! I'm Rayhan's assistant. I can help you learn about his DevOps expertise, services, and availability. What would you like to know?";
  }
  
  // Skills & Expertise
  if (/skill|expertise|technology|tech stack|what.*know/.test(msg)) {
    return "Rayhan specializes in:\n\n• Cloud Infrastructure: AWS (EC2, S3, Lambda, RDS, VPC)\n• Container Orchestration: Kubernetes, Docker\n• Infrastructure as Code: Terraform, CloudFormation\n• CI/CD: Jenkins, GitLab CI, GitHub Actions\n• Monitoring: Prometheus, Grafana, CloudWatch\n• Scripting: Python, Bash\n\nWould you like details on any specific area?";
  }
  
  // AWS specific
  if (/aws|amazon|cloud/.test(msg)) {
    return "Rayhan has extensive AWS experience including:\n\n• Designing multi-AZ production environments\n• Cost optimization strategies\n• Security best practices (IAM, VPC, Security Groups)\n• Serverless architectures (Lambda, API Gateway)\n• Database management (RDS, DynamoDB)\n\nHe can help migrate your infrastructure to AWS or optimize existing setups.";
  }
  
  // Kubernetes/Docker
  if (/kubernetes|k8s|docker|container/.test(msg)) {
    return "Rayhan can help with:\n\n• Kubernetes cluster setup and management\n• Helm charts and package management\n• Docker containerization strategies\n• Microservices deployment\n• Auto-scaling and load balancing\n\nHe's deployed production-grade container orchestration for multiple clients.";
  }
  
  // Terraform/IaC
  if (/terraform|infrastructure.*code|iac/.test(msg)) {
    return "Rayhan uses Infrastructure as Code extensively:\n\n• Terraform for multi-cloud deployments\n• Modular and reusable infrastructure code\n• State management best practices\n• CI/CD integration for infrastructure\n\nHe can help you implement IaC from scratch or improve existing setups.";
  }
  
  // Services
  if (/service|offer|help|do/.test(msg)) {
    return "Rayhan offers:\n\n• Cloud Architecture Design\n• Infrastructure Migration (on-prem to cloud)\n• CI/CD Pipeline Implementation\n• Container Orchestration Setup\n• Monitoring & Observability Solutions\n• DevOps Consulting & Training\n\nAll solutions are tailored to your specific needs and scale.";
  }
  
  // Pricing/Rates
  if (/price|cost|rate|fee|charge|budget/.test(msg)) {
    return "Rayhan's rates vary based on project scope and complexity:\n\n• Hourly consulting: $100-150/hour\n• Project-based pricing available\n• Long-term contracts negotiable\n\nFor a detailed quote, please use the contact form or email directly.";
  }
  
  // Availability
  if (/available|availability|hire|when/.test(msg)) {
    return "Rayhan is currently available for new projects! He typically responds to inquiries within 24 hours. Use the contact form on this site or reach out directly to discuss your needs.";
  }
  
  // Contact
  if (/contact|email|reach|get in touch/.test(msg)) {
    return "You can reach Rayhan through:\n\n• Contact form on this website (scroll down)\n• Email: rayhan@example.com\n• LinkedIn: [link in footer]\n\nHe typically responds within 24 hours.";
  }
  
  // Projects/Portfolio
  if (/project|portfolio|work|example|case study/.test(msg)) {
    return "Rayhan has worked on:\n\n• Multi-AZ AWS production environments for high-traffic applications\n• Kubernetes cluster migrations serving 100k+ users\n• CI/CD pipelines reducing deployment time by 80%\n• Infrastructure cost optimization saving clients 40%+\n\nScroll down to see detailed case studies!";
  }
  
  // Experience
  if (/experience|background|years/.test(msg)) {
    return "Rayhan has 5+ years of DevOps experience, working with startups and enterprises. He's handled infrastructure serving millions of users and has expertise in both greenfield projects and legacy system modernization.";
  }
  
  // Default response
  return "I can help you learn about:\n\n• Rayhan's skills and expertise\n• Services offered\n• Pricing and availability\n• Past projects\n• How to get in touch\n\nWhat would you like to know?";
}
