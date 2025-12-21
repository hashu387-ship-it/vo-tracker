#!/bin/bash

echo "============================================"
echo "VO Tracker - Vercel Deployment Script"
echo "============================================"
echo ""

# Check if we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Prompt to merge to main first
echo ""
echo "⚠️  IMPORTANT: You should merge your changes to 'main' branch first!"
echo ""
echo "Steps to follow:"
echo "1. Create a Pull Request from $CURRENT_BRANCH to main"
echo "2. Review and merge the PR"
echo "3. Switch to main branch: git checkout main"
echo "4. Pull latest changes: git pull origin main"
echo "5. Run this script again from main branch"
echo ""

read -p "Are you on the main branch and ready to deploy? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Deployment cancelled. Please merge to main first."
    exit 1
fi

echo ""
echo "============================================"
echo "Deploying to Vercel..."
echo "============================================"
echo ""

# Deploy using npx vercel
npx vercel --prod

echo ""
echo "============================================"
echo "Post-Deployment Checklist"
echo "============================================"
echo ""
echo "✅ Make sure you've completed these steps:"
echo ""
echo "1. Environment Variables:"
echo "   - Go to Vercel Dashboard > Settings > Environment Variables"
echo "   - Add all variables from .env.vercel.template"
echo ""
echo "2. Database Migration:"
echo "   - Run: node run-migration.js"
echo "   - Or execute prisma/add-file-attachments-migration.sql in Supabase"
echo ""
echo "3. Supabase Storage:"
echo "   - Create 'vo-documents' bucket (public)"
echo "   - Add storage policies (see VERCEL_DEPLOYMENT.md)"
echo ""
echo "4. Clerk Configuration:"
echo "   - Update allowed domains with your Vercel URL"
echo "   - Update redirect URLs in Clerk Dashboard"
echo ""
echo "5. Test the Application:"
echo "   - Visit your Vercel URL"
echo "   - Test authentication"
echo "   - Test file upload/download"
echo ""
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"
echo ""
