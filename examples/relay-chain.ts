/**
 * Example: Relay Chain for Content Creation Pipeline
 * 
 * This example demonstrates a relay chain that creates a blog post
 * through multiple sequential steps:
 * 1. Research and outline
 * 2. Write draft
 * 3. Edit and polish
 * 4. Add SEO metadata
 */

import { RelayChainService } from '../src/services/orchestrator-services/chain/relay-chain.service';
import { getDb } from '../src/database/database';

async function exampleRelayChain() {
  // Get database instance
  const db = getDb();
  await db.initialize();
  const pool = db.getInstance();
  
  // Create relay chain service
  const relayChainService = new RelayChainService(pool);

  // Define the blog post creation pipeline
  const blogPostPipeline = {
    steps: [
      {
        assistantId: 'researcher-assistant-id', // Replace with actual assistant ID
        messageTemplate: 'Research and create an outline for a blog post about "The Future of AI in Software Development"'
      },
      {
        assistantId: 'writer-assistant-id', // Replace with actual assistant ID
        messageTemplate: 'Using this outline:\n{{prev_reply}}\n\nWrite a comprehensive 800-word blog post.'
      },
      {
        assistantId: 'editor-assistant-id', // Replace with actual assistant ID
        messageTemplate: 'Edit and polish this blog post:\n{{prev_reply}}\n\nImprove clarity, fix grammar, and enhance readability.'
      },
      {
        assistantId: 'seo-assistant-id', // Replace with actual assistant ID
        messageTemplate: 'For this blog post:\n{{prev_reply}}\n\nGenerate SEO-optimized title, meta description, and 5 relevant tags.'
      }
    ],
    description: 'Blog Post Creation Pipeline',
    options: {
      baseDelayMs: 500,
      delayFactor: 1.5,
      maxDelayMs: 3000
    }
  };

  try {
    console.log('Planning relay chain...');
    const { parentId, stepIds } = await relayChainService.planRelayChain(blogPostPipeline);
    
    console.log(`✓ Relay chain planned successfully!`);
    console.log(`  Parent Task ID: ${parentId}`);
    console.log(`  Step IDs: ${stepIds.join(', ')}`);

    console.log('\nStarting execution...');
    await relayChainService.runRelayChain(parentId);

    console.log('✓ Relay chain completed!');

    // Get final results
    console.log('\nFetching results...');
    const progress = await relayChainService.getRelayChainProgress(parentId);
    console.log(`Progress: ${progress.done}/${progress.total} steps completed (${progress.pct}%)`);
    console.log(`Step Track: ${progress.stepTrack}`);

    // Get each step's output
    for (let i = 0; i < stepIds.length; i++) {
      const task = await relayChainService.taskService.getTaskById(stepIds[i]);
      if (task && task.outputData) {
        const output = typeof task.outputData === 'string' 
          ? JSON.parse(task.outputData) 
          : task.outputData;
        
        console.log(`\n--- Step ${i + 1} Output ---`);
        console.log(output.reply);
      }
    }

  } catch (error) {
    console.error('Error running relay chain:', error);
  } finally {
    await db.close();
  }
}

/**
 * Example: Design to Implementation Pipeline
 * 
 * Creates a complete web component from design to code
 */
async function exampleDesignToCode() {
  const db = getDb();
  await db.initialize();
  const pool = db.getInstance();
  const relayChainService = new RelayChainService(pool);

  const designToCodePipeline = {
    steps: [
      {
        assistantId: 'designer-assistant-id',
        messageTemplate: 'Design a modern, accessible navigation bar component with logo, menu items, and user profile dropdown.'
      },
      {
        assistantId: 'html-assistant-id',
        messageTemplate: 'Given this design specification:\n{{prev_reply}}\n\nCreate semantic HTML5 structure with proper ARIA attributes.'
      },
      {
        assistantId: 'css-assistant-id',
        messageTemplate: 'For this HTML:\n{{prev_reply}}\n\nCreate modern CSS with:\n- Flexbox layout\n- Responsive design\n- Smooth transitions\n- CSS custom properties'
      },
      {
        assistantId: 'js-assistant-id',
        messageTemplate: 'Complete this navigation component:\n{{prev_reply}}\n\nAdd JavaScript for:\n- Mobile menu toggle\n- Dropdown interactions\n- Accessibility keyboard navigation'
      },
      {
        assistantId: 'reviewer-assistant-id',
        messageTemplate: 'Review this complete component:\n{{prev_reply}}\n\nProvide feedback on:\n- Accessibility\n- Best practices\n- Performance\n- Potential improvements'
      }
    ],
    description: 'Navigation Component Creation',
    options: {
      baseDelayMs: 300,
      delayFactor: 2,
      maxDelayMs: 2000
    }
  };

  try {
    const { parentId } = await relayChainService.planRelayChain(designToCodePipeline);
    console.log(`Design-to-Code pipeline started: ${parentId}`);
    
    await relayChainService.runRelayChain(parentId);
    
    const progress = await relayChainService.getRelayChainProgress(parentId);
    console.log(`Pipeline completed: ${progress.pct}%`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
  }
}

/**
 * Example: Data Processing Pipeline
 * 
 * Demonstrates data transformation through multiple stages
 */
async function exampleDataPipeline() {
  const db = getDb();
  await db.initialize();
  const pool = db.getInstance();
  const relayChainService = new RelayChainService(pool);

  const dataPipeline = {
    steps: [
      {
        assistantId: 'extractor-assistant-id',
        messageTemplate: 'Extract key information from this customer feedback: "The product is great but the checkout process is confusing and takes too long."'
      },
      {
        assistantId: 'analyzer-assistant-id',
        messageTemplate: 'Analyze this extracted data:\n{{prev_reply}}\n\nIdentify:\n- Sentiment\n- Pain points\n- Positive aspects\n- Priority level'
      },
      {
        assistantId: 'categorizer-assistant-id',
        messageTemplate: 'Based on this analysis:\n{{prev_reply}}\n\nCategorize into product areas and assign to appropriate teams.'
      },
      {
        assistantId: 'recommender-assistant-id',
        messageTemplate: 'Using these insights:\n{{prev_reply}}\n\nGenerate actionable recommendations with priority and estimated effort.'
      }
    ],
    description: 'Customer Feedback Processing',
    options: {
      baseDelayMs: 200,
      maxDelayMs: 1000
    }
  };

  try {
    const { parentId } = await relayChainService.planRelayChain(dataPipeline);
    
    // Run and monitor progress
    relayChainService.runRelayChain(parentId).catch(console.error);
    
    // Poll progress (in real app, use websockets or events)
    const checkProgress = setInterval(async () => {
      const progress = await relayChainService.getRelayChainProgress(parentId);
      console.log(`Processing: ${progress.done}/${progress.total} steps - ${progress.stepTrack}`);
      
      if (progress.done === progress.total) {
        clearInterval(checkProgress);
        console.log('✓ Data pipeline completed!');
        await db.close();
      }
    }, 1000);
    
  } catch (error) {
    console.error('Error:', error);
    await db.close();
  }
}

// Export examples
export {
  exampleRelayChain,
  exampleDesignToCode,
  exampleDataPipeline
};

// Run example if called directly
if (require.main === module) {
  console.log('Running relay chain example...\n');
  exampleRelayChain().catch(console.error);
}
