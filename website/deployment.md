# Portfolio Website Deployment Guide

## Overview
This guide covers deploying your portfolio website with integrated chatbot functionality. We'll cover frontend hosting and backend chatbot infrastructure.

---

## Part 1: Frontend Hosting Options

### Option 1: Vercel (RECOMMENDED - Easiest)
**Best for:** Simple deployment, free SSL, global CDN

**Pros:**
- ✅ Free hosting for personal projects
- ✅ Automatic SSL certificates
- ✅ Global CDN (fast worldwide)
- ✅ Deploy via GitHub in 2 minutes
- ✅ Custom domain support
- ✅ Automatic deployments on git push

**Setup Steps:**
1. Create a GitHub repository
2. Push your `portfolio_with_chat.html` to the repo
3. Go to vercel.com and sign up with GitHub
4. Click "New Project" and import your repository
5. Deploy!

**Cost:** FREE for personal use

---

### Option 2: Netlify
**Best for:** Similar to Vercel, great for static sites

**Pros:**
- ✅ Free hosting
- ✅ Automatic SSL
- ✅ Easy form handling
- ✅ Deploy from GitHub
- ✅ Custom domains

**Setup Steps:**
1. Sign up at netlify.com
2. Drag and drop your HTML file, or connect to GitHub
3. Site goes live instantly

**Cost:** FREE for personal use

---

### Option 3: GitHub Pages
**Best for:** Portfolio sites, open source projects

**Pros:**
- ✅ Completely free
- ✅ Integrated with GitHub
- ✅ Custom domain support

**Cons:**
- ❌ Slower than Vercel/Netlify
- ❌ Manual SSL setup for custom domains

**Setup Steps:**
1. Create a GitHub repo named `yourusername.github.io`
2. Upload your HTML file (rename to `index.html`)
3. Enable GitHub Pages in repo settings
4. Access at `https://yourusername.github.io`

**Cost:** FREE

---

### Option 4: AWS S3 + CloudFront (For DevOps Portfolio)
**Best for:** Showcasing your AWS skills

**Pros:**
- ✅ Shows infrastructure expertise
- ✅ High performance with CloudFront CDN
- ✅ Full control
- ✅ Great talking point in interviews

**Cons:**
- ❌ More complex setup
- ❌ Small cost (typically $1-5/month)

**Setup (Infrastructure as Code):**
```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# S3 Bucket for website
resource "aws_s3_bucket" "portfolio" {
  bucket = "your-portfolio-bucket-name"
}

resource "aws_s3_bucket_website_configuration" "portfolio" {
  bucket = aws_s3_bucket.portfolio.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_public_access_block" "portfolio" {
  bucket = aws_s3_bucket.portfolio.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "portfolio" {
  bucket = aws_s3_bucket.portfolio.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.portfolio.arn}/*"
      }
    ]
  })
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "portfolio" {
  origin {
    domain_name = aws_s3_bucket.portfolio.bucket_regional_domain_name
    origin_id   = "S3-Portfolio"
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-Portfolio"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

**Cost:** ~$1-3/month

---

## Part 2: Chatbot Backend Options

### Option 1: AWS Lambda + API Gateway (RECOMMENDED)
**Best for:** Cost-effective, serverless, scalable

**Architecture:**
```
User → Website → API Gateway → Lambda Function → OpenAI/Anthropic API → Response
```

**Setup Steps:**

1. **Create Lambda Function (Python):**
```python
# lambda_function.py
import json
import os
import boto3
from anthropic import Anthropic

def lambda_handler(event, context):
    # Parse incoming message
    body = json.loads(event['body'])
    user_message = body.get('message', '')
    
    # Initialize Anthropic client
    client = Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])
    
    # System prompt about your services
    system_prompt = """You are a helpful assistant for Rayhan Abdurrahim, a DevOps Engineer.
    
    You can answer questions about:
    - His expertise: AWS, Kubernetes, Terraform, Docker, CI/CD
    - Services: Infrastructure design, cloud migration, automation, security
    - Availability: Currently available for consulting projects
    - Rates: $100-150/hour depending on project scope
    - Contact: rayhan@example.com
    
    Be friendly, professional, and concise. If asked technical questions, demonstrate deep knowledge.
    If someone wants to hire him, encourage them to use the contact form or email directly."""
    
    # Call Claude API
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system=system_prompt,
        messages=[{
            "role": "user",
            "content": user_message
        }]
    )
    
    # Extract response
    response_text = message.content[0].text
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'reply': response_text
        })
    }
```

2. **Terraform for Backend Infrastructure:**
```hcl
# chatbot_backend.tf

# Lambda Function
resource "aws_lambda_function" "chatbot" {
  filename      = "lambda_function.zip"
  function_name = "portfolio-chatbot"
  role          = aws_iam_role.lambda_role.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 30

  environment {
    variables = {
      ANTHROPIC_API_KEY = var.anthropic_api_key
    }
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "portfolio-chatbot-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# API Gateway
resource "aws_apigatewayv2_api" "chatbot" {
  name          = "portfolio-chatbot-api"
  protocol_type = "HTTP"
  
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["content-type"]
  }
}

resource "aws_apigatewayv2_integration" "chatbot" {
  api_id           = aws_apigatewayv2_api.chatbot.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.chatbot.invoke_arn
}

resource "aws_apigatewayv2_route" "chatbot" {
  api_id    = aws_apigatewayv2_api.chatbot.id
  route_key = "POST /chat"
  target    = "integrations/${aws_apigatewayv2_integration.chatbot.id}"
}

resource "aws_apigatewayv2_stage" "chatbot" {
  api_id      = aws_apigatewayv2_api.chatbot.id
  name        = "prod"
  auto_deploy = true
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.chatbot.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.chatbot.execution_arn}/*/*"
}

output "api_endpoint" {
  value = "${aws_apigatewayv2_api.chatbot.api_endpoint}/prod/chat"
}
```

**Cost:** ~$0-5/month (Lambda free tier: 1M requests/month)

---

### Option 2: Railway.app / Render.com (Easiest Backend)
**Best for:** Quick deployment without AWS complexity

**Railway Setup:**
1. Create a simple Express.js server:
```javascript
// server.js
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are a helpful assistant for Rayhan Abdurrahim, a DevOps Engineer...`,
      messages: [{
        role: 'user',
        content: message
      }]
    });
    
    res.json({ reply: response.content[0].text });
  } catch (error) {
    res.status(500).json({ error: 'Error processing request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

2. Deploy to Railway:
   - Push to GitHub
   - Connect Railway to your repo
   - Add ANTHROPIC_API_KEY environment variable
   - Deploy!

**Cost:** FREE tier available, then $5/month

---

### Option 3: Self-hosted on Your Own Server
**Best for:** Full control, learning experience

**Setup with Docker:**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**Deploy to your VPS:**
```bash
# Build and run
docker build -t portfolio-chatbot .
docker run -d -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your_key \
  --name chatbot \
  portfolio-chatbot
```

**Cost:** Depends on VPS (~$5-10/month)

---

## Recommended Architecture for DevOps Portfolio

**Best Option: Showcase Your Skills**

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
│  Website: Vercel (free) or AWS S3 + CloudFront         │
│  Custom Domain: Namecheap/Cloudflare ($10/year)        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND API                           │
│  AWS Lambda + API Gateway (serverless)                  │
│  Managed with Terraform (IaC showcase)                  │
│  Cost: ~$2/month                                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   AI SERVICE                             │
│  Anthropic Claude API                                   │
│  Cost: Pay-per-use (~$0.01-0.10 per conversation)      │
└─────────────────────────────────────────────────────────┘
```

**Total Monthly Cost:** ~$12-15
- Domain: $1/month
- Frontend: Free (Vercel) or $2 (AWS)
- Backend: $2-3 (Lambda)
- AI API: $5-10 (depending on traffic)

---

## Security Best Practices

1. **API Key Management:**
   - Never hardcode API keys in frontend
   - Use environment variables
   - Use AWS Secrets Manager for production

2. **Rate Limiting:**
   - Implement in Lambda/backend
   - Prevent abuse and manage costs

3. **CORS:**
   - Only allow your domain in production
   - Use wildcard (*) only for testing

4. **Input Validation:**
   - Sanitize user inputs
   - Set message length limits

---

## Next Steps

1. **Start Simple:**
   - Deploy frontend to Vercel (5 minutes)
   - Use Railway for backend (10 minutes)
   - Test and iterate

2. **Level Up:**
   - Move to AWS Lambda + Terraform
   - Add custom domain
   - Implement analytics

3. **Showcase:**
   - Add this infrastructure as a project on your portfolio
   - Document your architecture
   - Share the Terraform code on GitHub

---

## Summary: What I Recommend

**For Quick Start (Today):**
- Frontend: Vercel
- Backend: Railway.app
- Total Time: 30 minutes
- Total Cost: FREE

**For Production (This Week):**
- Frontend: AWS S3 + CloudFront
- Backend: AWS Lambda + API Gateway
- Infrastructure: Terraform (show your IaC skills!)
- Total Time: 2-3 hours
- Total Cost: ~$15/month

**Best Long-term:**
AWS solution shows your DevOps expertise and becomes a talking point in interviews: "I built my portfolio infrastructure with Terraform, deployed it serverless on AWS Lambda, and integrated Claude AI for the chatbot."

Let me know which option you'd like to pursue and I can provide more detailed setup instructions!