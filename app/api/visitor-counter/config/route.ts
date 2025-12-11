import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to get widget configuration
 * Allows customization of the embedded visitor counter widget
 */
export async function GET(request: NextRequest) {
  try {
    // Get optional query parameters for customization
    const theme = request.nextUrl.searchParams.get('theme') || 'light';
    const position = request.nextUrl.searchParams.get('position') || 'bottom-right';

    // Return default configuration
    const config = {
      status: 'success',
      theme,
      position,
      script: {
        url: '/real-visitor-counter.js',
        async: true,
        defer: false,
      },
      styles: {
        light: {
          background: '#ffffff',
          text: '#333333',
          accent: '#4CAF50',
          border: '1px solid #ddd',
        },
        dark: {
          background: '#333333',
          text: '#ffffff',
          accent: '#4CAF50',
          border: '1px solid #555',
        },
      },
      embedExample: `
<!-- Add this container where you want the counter to appear -->
<div id="real-visitor-counter"></div>

<!-- Add this script tag before closing body -->
<script src="https://your-domain.com/real-visitor-counter.js"
  data-container="real-visitor-counter"
  data-theme="${theme}"
  data-position="${position}">
</script>
      `,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(config, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to validate and store custom configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate configuration
    const validationResult = validateConfig(body);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.errors },
        { status: 400 }
      );
    }

    // In a real implementation, store this configuration for the site
    const storedConfig = {
      status: 'success',
      message: 'Configuration stored successfully',
      config: body,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(storedConfig, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

/**
 * Validate configuration object
 */
function validateConfig(config: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  if (config.theme && !['light', 'dark'].includes(config.theme)) {
    errors.push('Invalid theme. Must be "light" or "dark"');
  }

  if (config.position && !['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(config.position)) {
    errors.push('Invalid position. Must be one of: top-left, top-right, bottom-left, bottom-right');
  }

  if (config.containerId && typeof config.containerId !== 'string') {
    errors.push('containerId must be a string');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
