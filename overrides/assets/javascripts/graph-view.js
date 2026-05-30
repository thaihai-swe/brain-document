// Graph View for MkDocs Material
// Visualizes connections between pages using D3.js force-directed graph

let graphData = { nodes: [], links: [] };
let simulation;
let svg, g, link, node, text;
let linkDistance = 100;

// Toggle graph view modal
function toggleGraphView() {
  const modal = document.getElementById('graph-modal');
  if (modal.style.display === 'none') {
    modal.style.display = 'flex';
    if (!simulation) {
      initGraph();
    }
  } else {
    modal.style.display = 'none';
  }
}

// Initialize graph on page load
document.addEventListener('DOMContentLoaded', function() {
  // Keyboard shortcut: G
  document.addEventListener('keydown', function(e) {
    if (e.key === 'g' || e.key === 'G') {
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
          toggleGraphView();
        }
      }
    }
  });

  // Close modal on escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('graph-modal');
      if (modal.style.display !== 'none') {
        toggleGraphView();
      }
    }
  });

  // Close modal on background click
  document.getElementById('graph-modal')?.addEventListener('click', function(e) {
    if (e.target === this) {
      toggleGraphView();
    }
  });
});

// Build graph data from navigation
function buildGraphData() {
  const nodes = [];
  const links = [];
  const nodeMap = new Map();

  // Get current page
  const currentPath = window.location.pathname;

  // Parse navigation to build nodes
  const navItems = document.querySelectorAll('.md-nav__link');
  navItems.forEach((item, index) => {
    const href = item.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#')) {
      const title = item.textContent.trim();
      const path = href.replace(/^\.\.\//, '').replace(/\/$/, '');

      if (!nodeMap.has(path)) {
        const node = {
          id: path,
          title: title,
          path: href,
          isCurrent: currentPath.includes(path)
        };
        nodes.push(node);
        nodeMap.set(path, nodes.length - 1);
      }
    }
  });

  // Parse content for wiki-links and markdown links
  const content = document.querySelector('.md-content__inner');
  if (content) {
    const currentNode = nodes.find(n => n.isCurrent);
    if (currentNode) {
      // Find all links in content
      const contentLinks = content.querySelectorAll('a[href]');
      contentLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          const targetPath = href.replace(/^\.\.\//, '').replace(/\/$/, '');
          const targetIndex = nodeMap.get(targetPath);
          const sourceIndex = nodeMap.get(currentNode.id);

          if (targetIndex !== undefined && sourceIndex !== undefined) {
            links.push({
              source: sourceIndex,
              target: targetIndex
            });
          }
        }
      });
    }
  }

  // Add some connections based on folder structure
  nodes.forEach((node, i) => {
    const parts = node.id.split('/');
    if (parts.length > 1) {
      // Link to parent folder
      const parentPath = parts.slice(0, -1).join('/');
      const parentIndex = nodeMap.get(parentPath);
      if (parentIndex !== undefined && parentIndex !== i) {
        links.push({ source: parentIndex, target: i });
      }
    }
  });

  return { nodes, links };
}

// Initialize the graph
function initGraph() {
  graphData = buildGraphData();

  const canvas = document.getElementById('graph-canvas');
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // Clear existing SVG
  d3.select('#graph-canvas').selectAll('*').remove();

  // Create SVG
  svg = d3.select('#graph-canvas')
    .attr('width', width)
    .attr('height', height);

  // Add zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  // Create container group
  g = svg.append('g');

  // Create force simulation
  simulation = d3.forceSimulation(graphData.nodes)
    .force('link', d3.forceLink(graphData.links).distance(linkDistance))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30));

  // Create links
  link = g.append('g')
    .selectAll('line')
    .data(graphData.links)
    .enter().append('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 2);

  // Create nodes
  node = g.append('g')
    .selectAll('circle')
    .data(graphData.nodes)
    .enter().append('circle')
    .attr('r', d => d.isCurrent ? 12 : 8)
    .attr('fill', d => d.isCurrent ? '#635BFF' : '#06B6D4')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))
    .on('click', (event, d) => {
      window.location.href = d.path;
    })
    .on('mouseover', function(event, d) {
      d3.select(this).attr('r', d.isCurrent ? 14 : 10);
    })
    .on('mouseout', function(event, d) {
      d3.select(this).attr('r', d.isCurrent ? 12 : 8);
    });

  // Add labels
  text = g.append('g')
    .selectAll('text')
    .data(graphData.nodes)
    .enter().append('text')
    .text(d => d.title.length > 20 ? d.title.substring(0, 20) + '...' : d.title)
    .attr('font-size', 10)
    .attr('dx', 12)
    .attr('dy', 4)
    .style('pointer-events', 'none')
    .style('user-select', 'none');

  // Update positions on tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    text
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  });
}

// Drag functions
function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

// Reset graph view
function resetGraph() {
  if (simulation) {
    const canvas = document.getElementById('graph-canvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    simulation
      .force('center', d3.forceCenter(width / 2, height / 2))
      .alpha(1)
      .restart();

    // Reset zoom
    svg.transition().duration(750).call(
      d3.zoom().transform,
      d3.zoomIdentity
    );
  }
}

// Center current page
function centerCurrentPage() {
  if (simulation) {
    const currentNode = graphData.nodes.find(n => n.isCurrent);
    if (currentNode) {
      const canvas = document.getElementById('graph-canvas');
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      const scale = 1.5;
      const x = width / 2 - currentNode.x * scale;
      const y = height / 2 - currentNode.y * scale;

      svg.transition().duration(750).call(
        d3.zoom().transform,
        d3.zoomIdentity.translate(x, y).scale(scale)
      );
    }
  }
}

// Update link distance
function updateLinkDistance(value) {
  linkDistance = parseInt(value);
  if (simulation) {
    simulation.force('link').distance(linkDistance);
    simulation.alpha(1).restart();
  }
}
